"use strict";
import { webcrypto } from "one-webcrypto";
import {
  concat,
  fromString as uFromString,
  toString as uToString
} from "uint8arrays";
import {
  aesGenKey,
  aesExportKey,
  rsa,
  importAesKey,
  aesEncrypt,
  aesDecrypt,
  sha256,
  did as didLib
} from "@oddjs/odd/components/crypto/implementation/browser";
import { SymmAlg } from "keystore-idb/types.js";
export { aesDecrypt, aesEncrypt };
const BASE58_DID_PREFIX = "did:key:z";
export function publicKeyToDid(crypto, publicKey, keyType) {
  const prefix = crypto.did.keyTypes[keyType]?.magicBytes;
  if (prefix === null) {
    throw new Error(`Key type '${keyType}' not supported, available types: ${Object.keys(crypto.did.keyTypes).join(", ")}`);
  }
  const prefixedBuf = concat([prefix, publicKey]);
  return BASE58_DID_PREFIX + uToString(prefixedBuf, "base58btc");
}
export async function writeKeyToDid(crypto) {
  const [pubKey, ksAlg] = await Promise.all([
    crypto.keystore.publicWriteKey(),
    crypto.keystore.getAlgorithm()
  ]);
  return publicKeyToDid(crypto, pubKey, ksAlg);
}
export const ALGORITHM = SymmAlg.AES_GCM;
export async function create(crypto, { humanName }) {
  const rootDID = await writeKeyToDid(crypto);
  const deviceName = await createDeviceName(rootDID);
  const key = await aesGenKey(ALGORITHM);
  const exported = await aesExportKey(key);
  const exchangeKey = await crypto.keystore.publicExchangeKey();
  const encryptedKey = uToString(
    await rsa.encrypt(exported, exchangeKey),
    "base64pad"
  );
  const initialDevices = {};
  initialDevices[deviceName] = {
    aes: encryptedKey,
    name: deviceName,
    did: rootDID,
    exchange: toString(exchangeKey)
  };
  return {
    username: deviceName,
    humanName,
    rootDID,
    devices: initialDevices
  };
}
export async function encryptTo(creator, ids, data) {
  if (!data) {
    let group3 = function(data2) {
      return encryptTo(creator, ids, data2);
    };
    var group2 = group3;
    group3.groupMembers = ids;
    return group3;
  }
  const key = await aesGenKey(SymmAlg.AES_GCM);
  const encryptedKeys = {};
  for (const id of (ids || []).concat([creator])) {
    for await (const deviceName of Object.keys(id.devices)) {
      encryptedKeys[deviceName] = toString(
        await rsa.encrypt(
          await aesExportKey(key),
          fromString(id.devices[deviceName].exchange)
        )
      );
    }
  }
  const payload = await encryptContent(key, data);
  return { payload, devices: encryptedKeys, creator };
}
export async function decryptMsg(crypto, encryptedMsg) {
  const rootDID = await writeKeyToDid(crypto);
  const deviceName = await createDeviceName(rootDID);
  const encryptedKey = encryptedMsg.devices[deviceName];
  const decryptedKey = await decryptKey(crypto, encryptedKey);
  const msgBuf = uFromString(encryptedMsg.payload, "base64pad");
  const decryptedMsg = await aesDecrypt(msgBuf, decryptedKey, ALGORITHM);
  return uToString(decryptedMsg);
}
export async function group(creator, ids, key) {
  function _group(data) {
    return encryptContent(key, data);
  }
  const encryptedKeys = {};
  for (const id of ids.concat([creator])) {
    for await (const deviceName of Object.keys(id.devices)) {
      encryptedKeys[deviceName] = toString(
        await rsa.encrypt(
          await aesExportKey(key),
          fromString(id.devices[deviceName].exchange)
        )
      );
    }
  }
  _group.encryptedKeys = encryptedKeys;
  _group.groupMembers = ids.concat([creator]);
  return _group;
}
group.AddToGroup = AddToGroup;
group.Decrypt = Decrypt;
export async function AddToGroup(group2, keyOrCrypto, identity) {
  const newEncryptedKeys = {};
  const newGroupMembers = [].concat(group2.groupMembers);
  if (keyOrCrypto instanceof CryptoKey) {
    for (const deviceName of Object.keys(identity.devices)) {
      newEncryptedKeys[deviceName] = toString(
        await rsa.encrypt(
          await aesExportKey(keyOrCrypto),
          fromString(identity.devices[deviceName].exchange)
        )
      );
    }
  } else {
    const myDID = await writeKeyToDid(keyOrCrypto);
    const theKey = group2.encryptedKeys[await createDeviceName(myDID)];
    const decryptedKey = await decryptKey(keyOrCrypto, theKey);
    for (const deviceName of Object.keys(identity.devices)) {
      const device = identity.devices[deviceName];
      const newEncryptedKey = toString(
        await rsa.encrypt(
          await aesExportKey(decryptedKey),
          fromString(device.exchange)
        )
      );
      newEncryptedKeys[device.name] = newEncryptedKey;
    }
  }
  newGroupMembers.push(identity);
  return Object.assign({}, group2, {
    encryptedKeys: newEncryptedKeys,
    groupMembers: newGroupMembers
  });
}
export async function Decrypt(group2, oddCrypto, msg) {
  const did = await writeKeyToDid(oddCrypto);
  const myKey = group2.encryptedKeys[await createDeviceName(did)];
  const decryptedKey = await decryptKey(oddCrypto, myKey);
  const decryptedMsg = await aesDecrypt(
    typeof msg === "string" ? uFromString(msg, "base64pad") : msg,
    decryptedKey,
    ALGORITHM
  );
  const string = uToString(decryptedMsg);
  return string;
}
export async function encryptContent(key, data) {
  const _data = typeof data === "string" ? uFromString(data) : data;
  const encrypted = toString(await aesEncrypt(
    _data,
    key,
    ALGORITHM
  ));
  return encrypted;
}
export async function encryptKey(key, exchangeKey) {
  const encryptedKey = uToString(
    await rsa.encrypt(await aesExportKey(key), exchangeKey),
    "base64pad"
  );
  return encryptedKey;
}
export async function decryptKey(crypto, encryptedKey) {
  const decrypted = await crypto.keystore.decrypt(fromString(encryptedKey));
  const key = await importAesKey(decrypted, SymmAlg.AES_GCM);
  return key;
}
function hasProp(data, prop) {
  return typeof data === "object" && data != null && prop in data;
}
function isCryptoKey(val) {
  return hasProp(val, "algorithm") && hasProp(val, "extractable") && hasProp(val, "type");
}
export async function addDevice(id, crypto, newDid, exchangeKey) {
  const existingDid = await writeKeyToDid(crypto);
  const existingDeviceName = await createDeviceName(existingDid);
  const secretKey = await decryptKey(
    crypto,
    id.devices[existingDeviceName].aes
  );
  let encryptedKey;
  let exchangeString;
  if (typeof exchangeKey === "string") {
    const key = fromString(exchangeKey);
    encryptedKey = await encryptKey(secretKey, key);
    exchangeString = exchangeKey;
  } else if (ArrayBuffer.isView(exchangeKey)) {
    encryptedKey = await encryptKey(secretKey, exchangeKey);
    exchangeString = toString(exchangeKey);
  } else if (isCryptoKey(exchangeKey)) {
    encryptedKey = await encryptKey(secretKey, exchangeKey);
    exchangeString = toString(
      new Uint8Array(await webcrypto.subtle.exportKey("raw", exchangeKey))
    );
  } else {
    throw new Error("Exchange key should be string, uint8Array, or CryptoKey");
  }
  const newDeviceData = {};
  const name = await createDeviceName(newDid);
  newDeviceData[name] = {
    name,
    aes: encryptedKey,
    did: newDid,
    exchange: exchangeString
  };
  const newId = {
    ...id,
    devices: Object.assign(id.devices, newDeviceData)
  };
  return newId;
}
export async function createDeviceName(did) {
  const normalizedDid = did.normalize("NFD");
  const hashedUsername = await sha256(
    new TextEncoder().encode(normalizedDid)
  );
  return uToString(hashedUsername, "base32").slice(0, 32);
}
export function sign(keystore, msg) {
  return keystore.sign(uFromString(msg));
}
export async function signAsString(keystore, msg) {
  return toString(await keystore.sign(uFromString(msg)));
}
export async function verifyFromString(msg, sig, signingDid) {
  const { publicKey, type } = didToPublicKey(signingDid);
  const keyType = didLib.keyTypes[type];
  const isValid = await keyType.verify({
    message: uFromString(msg),
    publicKey,
    signature: uFromString(sig, "base64pad")
  });
  return isValid;
}
export async function getDeviceName(input) {
  if (typeof input === "string") {
    return createDeviceName(input);
  }
  const did = await writeKeyToDid(input);
  return createDeviceName(did);
}
export function fromString(str) {
  return uFromString(str, "base64pad");
}
export function toString(arr) {
  return uToString(arr, "base64pad");
}
const EDWARDS_DID_PREFIX = new Uint8Array([237, 1]);
const BLS_DID_PREFIX = new Uint8Array([234, 1]);
const RSA_DID_PREFIX = new Uint8Array([0, 245, 2]);
const KEY_TYPE = {
  RSA: "rsa",
  Edwards: "ed25519",
  BLS: "bls12-381"
};
const arrBufs = {
  equal: (aBuf, bBuf) => {
    const a = new Uint8Array(aBuf);
    const b = new Uint8Array(bBuf);
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
};
export function didToPublicKey(did) {
  if (!did.startsWith(BASE58_DID_PREFIX)) {
    throw new Error(
      "Please use a base58-encoded DID formatted `did:key:z...`"
    );
  }
  const didWithoutPrefix = "" + did.substring(BASE58_DID_PREFIX.length);
  const magicalBuf = uFromString(didWithoutPrefix, "base58btc");
  const { keyBuffer, type } = parseMagicBytes(magicalBuf);
  return {
    publicKey: keyBuffer,
    type
  };
}
function parseMagicBytes(prefixedKey) {
  if (hasPrefix(prefixedKey, RSA_DID_PREFIX)) {
    return {
      keyBuffer: prefixedKey.slice(RSA_DID_PREFIX.byteLength),
      type: KEY_TYPE.RSA
    };
  } else if (hasPrefix(prefixedKey, EDWARDS_DID_PREFIX)) {
    return {
      keyBuffer: prefixedKey.slice(EDWARDS_DID_PREFIX.byteLength),
      type: KEY_TYPE.Edwards
    };
  } else if (hasPrefix(prefixedKey, BLS_DID_PREFIX)) {
    return {
      keyBuffer: prefixedKey.slice(BLS_DID_PREFIX.byteLength),
      type: KEY_TYPE.BLS
    };
  }
  throw new Error("Unsupported key algorithm. Try using RSA.");
}
function hasPrefix(prefixedKey, prefix) {
  return arrBufs.equal(prefix, prefixedKey.slice(0, prefix.byteLength));
}
