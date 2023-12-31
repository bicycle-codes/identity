import { webcrypto } from 'one-webcrypto'
import { fromString, toString } from 'uint8arrays'
import {
    aesGenKey, aesExportKey, rsa, importAesKey, aesEncrypt,
    aesDecrypt, sha256
} from '@oddjs/odd/components/crypto/implementation/browser'
import { SymmAlg } from 'keystore-idb/types.js'
import { writeKeyToDid, DID } from '@ssc-half-light/util'
import type { Implementation } from '@oddjs/odd/components/crypto/implementation'
export {
    aesDecrypt,
    aesEncrypt
} from '@oddjs/odd/components/crypto/implementation/browser'

export interface Device {
    name:string,
    did:DID,
    aes:string,  /* the symmetric key for this account, encrypted to the
      exchange key for this device */
    exchange:string
}

/**
 * `devices` is a map of `{ <deviceName>: Device }`, where `device.aes` is the
 * AES key encrypted to this exchange key. The private side of this exchange
 * key is stored only on-device, in a keystore instance.
 */
export interface Identity {
    humanName:string
    username:string,
    rootDid:DID,
    devices:Record<string, Device>
}

export const ALGORITHM = SymmAlg.AES_GCM

/**
 * Create a new `identity`. This tracks a set of exchange keys by device.
 * This depends on the `crypto` interface of `odd`, the keystore that
 * holds the keys for your device. This creates a public record, meaning that
 * we can store this anywhere, whereas the private keys are non-exportable,
 * stored only on-device.
 * @param crypto Fission crypto implementation for the current device
 * @param {{ humanName:string }} opts The human-readable name of this identity
 * @returns {Identity}
 */
export async function create (
    crypto:Implementation,
    { humanName }:{ humanName:string }
):Promise<Identity> {
    const rootDid = await writeKeyToDid(crypto)  // this is equal to agentDid()
    const deviceName = await createDeviceName(rootDid)

    // this is the private aes key for this ID
    const key = await aesGenKey(ALGORITHM)
    const exported = await aesExportKey(key)
    const exchangeKey = await crypto.keystore.publicExchangeKey()

    // i think only RSA is supported currently
    const encryptedKey = toString(
        await rsa.encrypt(exported, exchangeKey),
        'base64pad'
    )

    const initialDevices:Identity['devices'] = {}
    initialDevices[deviceName] = {
        aes: encryptedKey,
        name: deviceName,
        did: rootDid,
        exchange: arrToString(exchangeKey)
    }

    return {
        username: deviceName,
        humanName,
        rootDid,
        devices: initialDevices
    }
}

/**
 * A record for an encrypted message. Contains `devices`, a record like
 *  `{ deviceName: <encrypted key> }`
 * You would decrypt the encrypted key -- message.devices[my-device-name] --
 *   with the device's exchange key
 * Then use the decrypted key to decrypt the payload
 */
export interface EncryptedMessage {
    creator:Identity, // the person who sent the message
    payload:string, /* This is the message, encrypted with the symm key for
        this message */
    devices:Record<string, string>
}

export type CurriedEncrypt = (data:string|Uint8Array) => Promise<EncryptedMessage>

/**
 * Encrypt a given message to the given set of identities.
 * To decrypt this message, use your exchange key to decrypt the symm key,
 * then use the symm key to decrypt the payload.
 *
 * This creates a new AES key each time it is called.
 * @param crypto odd crypto object
 * @param ids The Identities we are encrypting to
 * @param data The message we want to encrypt
 */
export async function encryptTo (
    creator:Identity,
    ids:Identity[],
    data?:string|Uint8Array
):Promise<EncryptedMessage | CurriedEncrypt> {
    if (!data) {
        function group (data:string|Uint8Array) {
            return encryptTo(creator, ids, data) as Promise<EncryptedMessage>
        }

        group.groupMembers = ids

        return group
    }

    // need to encrypt a key to each exchange key,
    // then encrypt the data with the key
    const key = await aesGenKey(SymmAlg.AES_GCM)

    const encryptedKeys = {}
    for (const id of ids.concat(creator)) {
        for await (const deviceName of Object.keys(id.devices)) {
            encryptedKeys[deviceName] = arrToString(
                await rsa.encrypt(await aesExportKey(key),
                    arrFromString(id.devices[deviceName].exchange)),
            )
        }
    }

    const payload = await encryptContent(key, data)
    return { payload, devices: encryptedKeys, creator }
}

/**
 * Decrypt the given encrypted message.
 *
 * @param {Implementation} crypto The crypto instance with the right keypair.
 * @param {EncryptedMessage} encryptedMsg The message to decrypt
 * @returns {string} The decrypted message.
 */
export async function decryptMsg (
    crypto:Implementation,
    encryptedMsg:EncryptedMessage
):Promise<string> {
    const rootDid = await writeKeyToDid(crypto)
    const deviceName = await createDeviceName(rootDid)
    const encryptedKey = encryptedMsg.devices[deviceName]
    const decryptedKey = await decryptKey(crypto, encryptedKey)
    const msgBuf = fromString(encryptedMsg.payload, 'base64pad')
    const decryptedMsg = await aesDecrypt(msgBuf, decryptedKey, ALGORITHM)
    return toString(decryptedMsg)
}

export type Group = {
    groupMembers:Identity[];
    // A map from deviceName to encrypted key string
    encryptedKeys:Record<string, string>;
    (data:string|Uint8Array):Promise<string>;
}

/**
 * Create a group with the given AES key. This is different than `encryptTo`
 * because this takes an existing key, instead of creating a new one.
 *
 * @param {Identity} creator The identity that is creating this group
 * @param {Identity[]} ids An array of group members
 * @param {CryptoKey} key The AES key for this group
 * @returns {Promise<Group>} Return a function that takes a string of data, and
 * returns a string of encrypted data. Has keys `encryptedKeys` and
 * `groupMemebers`. `encryptedKeys` is a map of `deviceName` to the encrypted
 * AES key for this group. `groupMembers` is an array of all the Identities
 * in this group.
 */
export async function group (
    creator:Identity,
    ids:Identity[],
    key:CryptoKey
):Promise<Group> {
    function _group (data:string|Uint8Array) {
        return encryptContent(key, data)
    }

    const encryptedKeys = {}
    for (const id of ids.concat(creator)) {
        for await (const deviceName of Object.keys(id.devices)) {
            encryptedKeys[deviceName] = arrToString(
                await rsa.encrypt(await aesExportKey(key),
                    arrFromString(id.devices[deviceName].exchange)),
            )
        }
    }

    _group.encryptedKeys = encryptedKeys
    _group.groupMembers = ids.concat([creator])

    return _group
}

group.AddToGroup = AddToGroup
group.Decrypt = Decrypt

/**
 * Add an identity to the group. Pass in either a CryptoKey or an odd crypto
 * object. If you pass in a Crypto.Implementation, then this will use it to
 * decrypt the group's AES key, then encrypt the key to the new identity.
 *
 * If you pass in a `CryptoKey`, then we simply encrypt it to the new identity.
 *
 * @param {Group} group The group you are adding to
 * @param {CryptoKey|Implementation} keyOrCrypto The key or instance of
 * @param {Identity} identity The identity you are adding to the group
 * odd crypto.
 */
export async function AddToGroup (
    group:Group,
    keyOrCrypto:CryptoKey|Implementation,
    identity:Identity,
):Promise<Group> {
    const newEncryptedKeys = {}
    const newGroupMembers:Identity[] =
        ([] as Identity[]).concat(group.groupMembers)

    if (keyOrCrypto instanceof CryptoKey) {
        // we have been passed the decrypted AES key

        for (const deviceName of Object.keys(identity.devices)) {
            // group.encryptedKeys[deviceName] = arrToString(
            newEncryptedKeys[deviceName] = arrToString(
                await rsa.encrypt(await aesExportKey(keyOrCrypto),
                    arrFromString(identity.devices[deviceName].exchange))
            )
        }
    } else {
        // `keyOrCrypto` is a Crypto instance
        // need to decrypt the AES key, then re-encrypt it to the new devices
        const myDID = await writeKeyToDid(keyOrCrypto)
        const theKey = group.encryptedKeys[await createDeviceName(myDID)]
        const decryptedKey = await decryptKey(keyOrCrypto, theKey)
        for (const deviceName of Object.keys(identity.devices)) {
            // now encrypt it to each new device
            const device = identity.devices[deviceName]
            const newEncryptedKey = arrToString(
                await rsa.encrypt(
                    await aesExportKey(decryptedKey),
                    arrFromString(device.exchange)
                )
            )

            newEncryptedKeys[device.name] = newEncryptedKey
        }
    }

    newGroupMembers.push(identity)

    return Object.assign({}, group, {
        encryptedKeys: newEncryptedKeys,
        groupMembers: newGroupMembers
    })
}

/**
 * Decrypt a message encrypted to a given group.
 * @param {Group} group The group containing the key
 * @param {Implementation} crypto An odd crypto instance
 * @param {string|Uint8Array} msg The message to decrypt
 * @returns {Promise<string>} The decrypted message
 */
export async function Decrypt (
    group:Group,
    crypto:Implementation,
    msg:string|Uint8Array
):Promise<string> {
    // get the right key from the group
    const did = await writeKeyToDid(crypto)
    const myKey = group.encryptedKeys[await createDeviceName(did)]

    const decryptedKey = await decryptKey(crypto, myKey)
    const msgBuf = typeof msg === 'string' ? fromString(msg, 'base64pad') : msg
    const decryptedMsg = await aesDecrypt(msgBuf, decryptedKey, ALGORITHM)
    return toString(decryptedMsg)
}

/**
 * Take data in string format, and encrypt it with the given symmetric key.
 * @param key The symmetric key used to encrypt/decrypt
 * @param data The text to encrypt
 * @returns {string}
 */
export async function encryptContent (
    key:CryptoKey,
    data:string|Uint8Array
):Promise<string> {
    const _data = (typeof data === 'string' ? fromString(data) : data)

    const encrypted = toString(await aesEncrypt(
        _data,
        key,
        ALGORITHM
    ), 'base64pad')

    return encrypted
}

/**
 * Encrypt a given AES key to the given exchange key
 * @param key The symmetric key
 * @param exchangeKey The exchange key to encrypt *to*
 * @returns the encrypted key, encoded as 'base64pad'
 */
export async function encryptKey (
    key:CryptoKey,
    exchangeKey:Uint8Array|CryptoKey
):Promise<string> {
    const encryptedKey = toString(
        await rsa.encrypt(await aesExportKey(key), exchangeKey),
        'base64pad'
    )

    return encryptedKey
}

/**
 * Decrypt the given encrypted key
 *
 * @param {string} encryptedKey The encrypted key, returned by `create`:
 * `identity.devices[name].aes`
 * @param {Implementation} crypto An instance of ODD crypto
 * @returns {Promise<CryptoKey>} The symmetric key
 */
export async function decryptKey (crypto:Implementation, encryptedKey:string)
:Promise<CryptoKey> {
    const decrypted = await crypto.keystore.decrypt(
        arrFromString(encryptedKey))

    const key = await importAesKey(decrypted, SymmAlg.AES_GCM)
    return key
}

function hasProp<K extends PropertyKey> (data: unknown, prop: K):
data is Record<K, unknown> {
    return typeof data === 'object' && data != null && prop in data
}

function isCryptoKey (val:unknown):val is CryptoKey {
    return (hasProp(val, 'algorithm') &&
        hasProp(val, 'extractable') && hasProp(val, 'type'))
}

/**
 * Add a device to this identity. This is performed from a device that is currently
 * registered. You need to get the exchange key of the new device somehow.
 *
 * @param {Identity} id The `Identity` instance to add to
 * @param {Implementation} crypto An instance of Fission's crypto
 * @param {string} newDid The DID of the new device
 * @param {Uint8Array} exchangeKey The exchange key of the new device
 * @returns {Promise<Identity>} A new identity object, with the new device
 */
export async function addDevice (
    id:Identity,
    crypto:Implementation,
    newDid:DID,
    exchangeKey:Uint8Array|CryptoKey|string,
):Promise<Identity> {
    // need to decrypt the existing AES key, then re-encrypt it to the
    // new did

    const existingDid = await writeKeyToDid(crypto)
    const existingDeviceName = await createDeviceName(existingDid)
    const secretKey = await decryptKey(crypto,
        id.devices[existingDeviceName].aes)

    let encryptedKey:string
    let exchangeString:string

    if (typeof exchangeKey === 'string') {
        const key = arrFromString(exchangeKey)
        encryptedKey = await encryptKey(secretKey, key)
        exchangeString = exchangeKey
    } else if (ArrayBuffer.isView(exchangeKey)) {
        // is uint8array
        encryptedKey = await encryptKey(secretKey, exchangeKey)
        exchangeString = arrToString(exchangeKey)
    } else if (isCryptoKey(exchangeKey)) {
        // is CryptoKey
        encryptedKey = await encryptKey(secretKey, exchangeKey)
        exchangeString = arrToString(
            new Uint8Array(await webcrypto.subtle.exportKey('raw', exchangeKey))
        )
    } else {
        throw new Error('Exchange key should be string, uint8Array, or CryptoKey')
    }

    const newDeviceData:Identity['devices'] = {}
    const name = await createDeviceName(newDid)

    newDeviceData[name] = {
        name,
        aes: encryptedKey,
        did: newDid,
        exchange: exchangeString
    }

    const newId:Identity = {
        ...id,
        devices: Object.assign(id.devices, newDeviceData)
    }

    return newId
}

/**
 * Create a 32 character, DNS-friendly hash of the given DID.
 *
 * @param {DID} did String representation of the DID for the device
 * @returns {string} The 32 character, DNS friendly hash
 */
export async function createDeviceName (did:DID):Promise<string> {
    const normalizedDid = did.normalize('NFD')
    const hashedUsername = await sha256(
        new TextEncoder().encode(normalizedDid)
    )
    return toString(hashedUsername, 'base32').slice(0, 32)
}

/**
 * Create a 32-character, DNS-friendly hash for a device. Takes either the DID
 * string or a crypto instance.
 * @param {DID|Implementation} input DID string or Crypto implementation
 * @returns {string} The 32-character hash string of the DID
 */
export async function getDeviceName (input:DID|Implementation):Promise<string> {
    if (typeof input === 'string') {
        return createDeviceName(input)
    }

    // is crypto object
    const did = await writeKeyToDid(input)
    return createDeviceName(did)
}

export const arrayBuffer = {
    fromString: arrFromString,
    toString: arrToString
}

function arrFromString (str:string) {
    return fromString(str, 'base64pad')
}

function arrToString (arr:Uint8Array) {
    return toString(arr, 'base64pad')
}
