import { webcrypto } from 'one-webcrypto'
import { fromString, toString } from 'uint8arrays'
import {
    aesGenKey, aesExportKey, rsa, importAesKey, aesEncrypt,
    aesDecrypt, sha256
} from '@oddjs/odd/components/crypto/implementation/browser'
import { SymmAlg } from 'keystore-idb/types.js'
import type { Crypto } from '@oddjs/odd'
import { writeKeyToDid, DID } from '@ssc-half-light/util'
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
 * `devices` is a map of { <deviceName>: Device }, where device.aes is the AES
 * key encrypted to this exchange key. The private side of this exchange key is
 * store only on-device, in a keystore instance.
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
 * This depends on the `crypto` interface of `odd`. That is the keystore that
 * holds the keys for your device. This creates a public record, meaning that
 * we can store this anywhere, whereas the private keys are non-exportable,
 * stored only on-device.
 * @param crypto Fission crypto implementation for the current device
 * @param opts { humanName } The human-readable name of this identity
 * @returns {Identity}
 */
export async function create (
    crypto:Crypto.Implementation,
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
 * devices is a record like
 *  { deviceName: <encrypted key> }
 *  You would decrypt the encrypted key -- message.devices[my-device-name] --
 *  with the device's exchange key
 *  Then use the decrypted key to decrypt the payload
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
 * @TODO
 */
export function decryptMsg (encryptedMsg:EncryptedMessage) {

}

export type Group = {
    groupMembers: Identity[];
    encryptedKeys: Record<string, string>;
    decrypt: (
        crypto:Crypto.Implementation,
        group:Group,
        msg:string|Uint8Array
    ) => Promise<string>;
    (data:string|Uint8Array): Promise<string>
}

/**
 * Create a group with the given AES key. This is different than `encryptTo`
 * because this takes an existing key, instead of creating a new one.
 * @param creator The identity that is creating this group
 * @param ids An array of group members
 * @param key The AES key for this group
 * @returns {Promise<Group>} Return a function
 * that takes a string of data and returns a string of encrypted data. Has keys
 * `encryptedKeys` and `groupMemebers`. `encryptedKeys` is a map of `deviceName`
 * to the encrypted AES key for this group. `groupMembers` is an array of all
 * the Identities in this group.
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

    /**
     * Decrypt a given message encrypted to this group
     */
    _group.decrypt = async function decrypt (
        crypto:Crypto.Implementation,
        group:Group,
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

    return _group
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
    // console.log('____data____', _data)

    const encrypted = toString(await aesEncrypt(
        _data,
        key,
        ALGORITHM
    ), 'base64pad')

    // console.log('**encyrptoeddd***', encrypted)
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
 * @param {string} encryptedKey The encrypted key, returned by `create`
 * -- identity.devices[name].aes
 * @param {Crypto.Implementation} crypto An instance of ODD crypto
 * @returns {Promise<CryptoKey>} The symmetric key
 */
export async function decryptKey (crypto:Crypto.Implementation, encryptedKey:string)
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
 * the existing devices are the only places that can decrypt the key
 * must call `add` from an existing device
 */

/**
 * Add a device to this identity. This is performed from a device that is currently
 * registered. You need to get the exchange key of the new device somehow.
 *
 * @param {Identity} id The `Identity` instance to add to
 * @param {Crypto.Implementation} crypto An instance of Fission's crypto
 * @param {string} newDid The DID of the new device
 * @param {Uint8Array} exchangeKey The exchange key of the new device
 * @returns {Identity} A new identity object, with the new device
 */
export async function add (
    id:Identity,
    crypto:Crypto.Implementation,
    newDid:DID,
    exchangeKey:Uint8Array|CryptoKey|string,
) {
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

    // const encrypted = await encryptKey(secretKey, _exchangeKey!)
    // const encrypted = await encryptKey(secretKey, _exchangeKey!)
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

export async function createDeviceName (did:DID):Promise<string> {
    const normalizedDid = did.normalize('NFD')
    const hashedUsername = await sha256(
        new TextEncoder().encode(normalizedDid)
    )
    return toString(hashedUsername, 'base32').slice(0, 32)
}

/**
 * Like `createDeviceName`, but can take a `crypto` object in addition to a
 * DID.
 * @param {DID|Crypto.Implementation} input DID string or Crypto implementation
 * @returns The optimally encoded hash of the DID
 */
export async function getDeviceName (input:DID|Crypto.Implementation):Promise<string> {
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
