import {
    concat,
    fromString as uFromString,
    toString as uToString
} from 'uint8arrays'
import { set, get } from 'idb-keyval'
import {
    DEFAULT_CHAR_SIZE,
    RSA_ALGORITHM,
    RSA_SIGN_ALG,
    BASE58_DID_PREFIX,
    DEFAULT_SIGN_KEY_NAME,
    DEFAULT_RSA_SIZE,
    DEFAULT_HASH_ALG,
    DEFAULT_ENCRYPT_KEY_NAME,
    AES_GCM,
    DEFAULT_SYMM_LEN,
    DEFAULT_SYMM_ALG,
    RSA_HASHING_ALGORITHM
} from './constants'
import {
    type HashAlg,
    KeyUse,
    did,
    arrBufToBase64,
    isCryptoKey,
    sha256,
    rsaOperations,
    normalizeUtf16ToBuf,
    normalizeBase64ToBuf,
    base64ToArrBuf,
    randomBuf,
    joinBufs
} from './util'
import type {
    CharSize,
    Msg,
    DID,
    RsaSize
} from './types'
import { SymmKeyLength } from './types'

// const ECC_WRITE_ALG = 'ECDSA'

/**
 * A class representing a user.
 *
 * By default, includes two "main" keypairs, and a "main" AES key.
 *   - `encryptKey` -- asymmetric key for encrypting
 *   - `signKey` -- asymmetric key for signing
 */
export class Identity {
    encryptKey:CryptoKeyPair
    signKey:CryptoKeyPair
    rootDID:DID
    rootDeviceName:string
    // devices:Record<string, { aes, name, humanReadableName, did:DID, encrypt }>
    aes:CryptoKey
    ENCRYPT_KEY:string
    SIGN_KEY:string

    constructor (opts:{
        encryptKey:CryptoKeyPair;
        signKey:CryptoKeyPair;
        aes:CryptoKey;
        DID:DID;
        deviceName:string;
    }, storage:{ encryptKeyName:string; signKeyName:string; }) {
        const { encryptKey, signKey, DID, aes, deviceName } = opts
        this.encryptKey = encryptKey
        this.signKey = signKey
        this.rootDID = DID
        this.rootDeviceName = deviceName
        this.aes = aes
        this.ENCRYPT_KEY = storage.encryptKeyName
        this.SIGN_KEY = storage.signKeyName
    }

    /**
     * Create a new Identity.
     * @param { encryptionKeyName, signKeyName} opts Key names used for storing
     * the main keypairs in indexedDB.
     * @returns {Identity} A new identity instance
     */
    static async create (opts:{
        type?: 'rsa';
        encryptKeyName:string;
        signKeyName:string;
    }):Promise<Identity> {
        const { encryptKeyName, signKeyName } = opts

        const encryptKeypair = await makeRSAKeypair(
            DEFAULT_RSA_SIZE,
            DEFAULT_HASH_ALG,
            KeyUse.Encrypt
        )
        const signKeypair = await makeRSAKeypair(
            DEFAULT_RSA_SIZE,
            DEFAULT_HASH_ALG,
            KeyUse.Sign
        )

        // the private AES key for this ID
        const AESKey = await aesGenKey({
            alg: AES_GCM,
            length: DEFAULT_SYMM_LEN
        })

        const rootDID = await writeKeyToDid(signKeypair)

        const id = new Identity({
            encryptKey: encryptKeypair,
            signKey: signKeypair,
            aes: AESKey,
            DID: rootDID,
            deviceName: await createDeviceName(rootDID)
        }, { encryptKeyName, signKeyName })

        // save the keys to indexedDB
        await Promise.all([
            set(encryptKeyName, encryptKeypair),
            set(signKeyName, signKeypair)
        ])

        return id

        // const key = await aesGenKey({ alg: AES_GCM, length: DEFAULT_SYMM_LEN })
        // const exported = await aesExportKey(key)

        // const pubKey = new Uint8Array(await window.crypto.subtle.exportKey(
        //     'spki',
        //     encryptKeypair.publicKey
        // ))

        // const encryptedKey = uToString(
        //     new Uint8Array(await rsaOperations.encrypt(
        //         exported,
        //         encryptKeypair.publicKey
        //     )),
        //     'base64pad'
        // )

        // const initialDevices:SerializedIdentity['devices'] = {}
        // initialDevices[deviceName] = {
        //     aes: encryptedKey,
        //     name: deviceName,
        //     humanReadableName: humanReadableDeviceName,
        //     did: rootDID,
        //     exchange: toString(pubKey)
        // }
    }
}

/**
 * Convert a public key to a DID format string.
 *
 * @param {Uint8Array} publicKey Public key as Uint8Array
 * @param {'rsa'} [keyType] 'rsa' only
 * @returns {DID}
 */
function publicKeyToDid (
    publicKey:Uint8Array,
    keyType = 'rsa'
):DID {
    // Prefix public-write key
    const prefix = did.keyTypes[keyType]?.magicBytes
    if (!prefix) {
        throw new Error(`Key type '${keyType}' not supported, ` +
            `available types: ${Object.keys(did.keyTypes).join(', ')}`)
    }

    const prefixedBuf = concat([prefix, publicKey])

    return (BASE58_DID_PREFIX + uToString(prefixedBuf, 'base58btc')) as DID
}

/**
 * Get this device's existing keypair, or create one. The "write" key is
 * used for signing things.
 *
 * @param {string} [keyName] The key name that the indexedDB data is stored under
 * @returns {Promise<CryptoKeyPair>}
 */
async function writeKey (
    keyName:string = DEFAULT_SIGN_KEY_NAME
):Promise<CryptoKeyPair> {
    let keypair = await get<CryptoKeyPair>(keyName)
    if (!keypair) {
        keypair = await makeRSAKeypair(
            DEFAULT_RSA_SIZE,
            DEFAULT_HASH_ALG,
            KeyUse.Sign
        )

        await set(keyName, keypair)
    }

    return keypair
}

async function exchangeKey (
    keyname:string = DEFAULT_ENCRYPT_KEY_NAME
):Promise<CryptoKeyPair> {
    let keypair = await get<CryptoKeyPair>(keyname)
    if (!keypair) {
        keypair = await makeRSAKeypair(
            DEFAULT_RSA_SIZE,
            DEFAULT_HASH_ALG,
            KeyUse.Encrypt
        )

        await set(keyname, keypair)
    }

    return keypair
}

/**
 * "write" key is for signing things
 * @param {CryptoKeyPair} publicWriteKey This device's write key.
 * @returns {Promise<DID>}
 */
async function writeKeyToDid (
    publicWriteKey:CryptoKeyPair
):Promise<DID> {
    const arr = await getPublicKeyAsArrayBuffer(publicWriteKey)
    const ksAlg = 'rsa'

    return publicKeyToDid(new Uint8Array(arr), ksAlg)
}

export async function getPublicKeyAsArrayBuffer (
    keypair:CryptoKeyPair
):Promise<ArrayBuffer> {
    const spki = await window.crypto.subtle.exportKey(
        'spki',
        keypair.publicKey
    )

    return spki
}

// export async function getPublicKeyAsString (keypair:CryptoKeyPair):Promise<string> {
//     const spki = await window.crypto.subtle.exportKey(
//         'spki',
//         keypair.publicKey
//     )
//     return arrBufToBase64(spki)
// }

export interface Device {
    name:string,
    did:DID,
    aes:string,  /* the symmetric key for this account, encrypted to the
      exchange key for this device */
    exchange:string,
    humanReadableName:string
}

/**
 * `devices` is a map of `{ <deviceName>: Device }`, where `device.aes` is the
 * AES key encrypted to this exchange key. The private side of this exchange
 * key is stored only on-device, in a keystore instance.
 */
export interface SerializedIdentity {
    humanName:string;
    username:string;
    rootDID:DID;
    devices:Record<string, Device>;
    storage:{ exchangeKeyName:string; writeKeyName:string; }
}

/**
 * Create a new `identity`. This tracks a set of keys by device.
 * Each device has 1 "encrypt" key and 1 "sign" key.
 *
 * @param {{
 *   humanName:string,
 *   humanReadableDeviceName:string,
 *   persist?:boolean
 *   storage?:{ exchangeKeyName, writeKeyName }
 * }} opts The human-readable name of this identity, and a name for the device,
 *         and `persist`, which will request "persistent" storage if passed in.
 * @returns {Promise<Identity>}
 */
export async function create ({
    humanName,
    humanReadableDeviceName,
    persist,
    storage = {
        exchangeKeyName: DEFAULT_ENCRYPT_KEY_NAME,
        writeKeyName: DEFAULT_SIGN_KEY_NAME
    }
}:{
    humanName:string,
    humanReadableDeviceName:string,
    persist?:boolean,
    storage:{
        exchangeKeyName:string,
        writeKeyName:string
    }
}):Promise<SerializedIdentity> {
    if (persist) {
        if (navigator.storage && navigator.storage.persist) {
            try {
                await navigator.storage.persist()
            } catch (err) {
                console.error(err)
            }
        }
    }

    const encryptKeypair = await makeRSAKeypair(
        DEFAULT_RSA_SIZE,
        DEFAULT_HASH_ALG,
        KeyUse.Encrypt
    )
    const signKeypair = await makeRSAKeypair(
        DEFAULT_RSA_SIZE,
        DEFAULT_HASH_ALG,
        KeyUse.Sign
    )

    const rootDID = await writeKeyToDid(signKeypair)
    const deviceName = await createDeviceName(rootDID)

    set(storage.exchangeKeyName, encryptKeypair)
    set(storage.writeKeyName, signKeypair)

    // this is the private AES key for this ID
    const key = await aesGenKey({ alg: AES_GCM, length: DEFAULT_SYMM_LEN })
    const exported = await aesExportKey(key)

    const pubKey = new Uint8Array(await window.crypto.subtle.exportKey(
        'spki',
        encryptKeypair.publicKey
    ))

    const encryptedKey = uToString(
        new Uint8Array(await rsaOperations.encrypt(
            exported,
            encryptKeypair.publicKey
        )),
        'base64pad'
    )

    const initialDevices:SerializedIdentity['devices'] = {}
    initialDevices[deviceName] = {
        aes: encryptedKey,
        name: deviceName,
        humanReadableName: humanReadableDeviceName,
        did: rootDID,
        exchange: toString(pubKey)
    }

    return {
        username: deviceName,
        humanName,
        rootDID,
        devices: initialDevices,
        storage: { ...storage }
    }
}

function aesGenKey (opts:{ alg, length } = {
    alg: DEFAULT_SYMM_ALG,
    length: DEFAULT_SYMM_LEN
}) {
    return window.crypto.subtle.generateKey({
        name: opts.alg,
        length: opts.length
    }, true, ['encrypt', 'decrypt'])
}

/**
 * A record for an encrypted message. Contains `devices`, a record like
 *  `{ deviceName: <encrypted key> }`
 * You would decrypt the encrypted key -- message.devices[my-device-name] --
 *   with the device's exchange key
 * Then use the decrypted key to decrypt the payload
 */
export interface EncryptedMessage<T extends string = string> {
    creator:SerializedIdentity, // the person who sent the message
    payload:T, /* This is the message, encrypted with the symm key for
        this message */
    devices:Record<string, string>
}

export type CurriedEncrypt = (data:string|Uint8Array) => Promise<EncryptedMessage>

/**
 * Encrypt a given message to the given set of identities.
 * To decrypt this message, use your exchange key to decrypt the symm key,
 * then use the symm key to decrypt the payload.
 *
 * Omit `ids` to encrypt a message to yourself.
 *
 * If you do not pass in an argument for `data`, then this will return
 * a partially applied function.
 *
 * This creates a new AES key each time it is called.
 *
 * @param {Implementation} crypto odd crypto object
 * @param {Identity[]} [ids] The Identities we are encrypting to
 * @param {string|Uint8Array} data The message we want to encrypt
 */
export async function encryptTo (
    creator:SerializedIdentity,
    ids:null|SerializedIdentity[],
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
    const key = await aesGenKey()

    const encryptedKeys = {}
    for (const id of (ids || []).concat([creator])) {
        for await (const deviceName of Object.keys(id.devices)) {
            const encrypted = await rsaOperations.encrypt(
                await aesExportKey(key),
                id.devices[deviceName].exchange
            )

            encryptedKeys[deviceName] = toString(new Uint8Array(encrypted))
        }
    }

    const payload = await encryptContent(key, data)
    return { payload, devices: encryptedKeys, creator }
}

/**
 * Decrypt the given encrypted message, that has been encrypted
 * to this device.
 *
 * @param {Implementation} crypto The crypto instance with the right keypair.
 * @param {EncryptedMessage} encryptedMsg The message to decrypt
 * @returns {string} The decrypted message.
 */
export async function decryptMsg (
    id:Identity,
    encryptedMsg:EncryptedMessage,
):Promise<string> {
    const myDid = await writeKeyToDid(await writeKey())
    const deviceName = await createDeviceName(myDid)
    const encryptedKey = encryptedMsg.devices[deviceName]
    const decryptedKey = await decryptKey(encryptedKey)
    const msgBuf = uFromString(encryptedMsg.payload, 'base64pad')
    const decryptedMsg = await aesDecrypt(msgBuf, decryptedKey)
    return uToString(decryptedMsg)
}

export type Group = {
    groupMembers:SerializedIdentity[];
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
    creator:SerializedIdentity,
    ids:SerializedIdentity[],
    key:CryptoKey
):Promise<Group> {
    function _group (data:string|Uint8Array) {
        return encryptContent(key, data)
    }

    const encryptedKeys = {}
    for (const id of ids.concat([creator])) {
        for await (const deviceName of Object.keys(id.devices)) {
            // const _key = await aesExportKey(key)

            encryptedKeys[deviceName] = await encryptKey(
                key,
                id.devices[deviceName].exchange
            )
        }
    }

    _group.encryptedKeys = encryptedKeys
    _group.groupMembers = ids.concat([creator])

    return _group
}

group.AddToGroup = AddToGroup
// group.Decrypt = Decrypt

/**
 * Add an identity to the group. Pass in either a CryptoKey or an odd crypto
 * object. If you pass in a Crypto.Implementation, then this will use it to
 * decrypt the group's AES key, then encrypt the key to the new identity.
 *
 * If you pass in a `CryptoKey`, then we simply encrypt it to the new identity.
 *
 * @param {Group} group The group you are adding to
 * @param {CryptoKey} keyOrCrypto The key or instance of
 * @param {Identity} identity The identity you are adding to the group
 * odd crypto.
 */
export async function AddToGroup (
    group:Group,
    key:CryptoKey,
    identity:SerializedIdentity,
):Promise<Group> {
    const newEncryptedKeys = {}
    const newGroupMembers:SerializedIdentity[] =
        ([] as SerializedIdentity[]).concat(group.groupMembers)

    for (const deviceName of Object.keys(identity.devices)) {
        newEncryptedKeys[deviceName] = await encryptKey(
            key,
            group.encryptedKeys[deviceName]
        )
    }

    newGroupMembers.push(identity)

    return Object.assign({}, group, {
        encryptedKeys: newEncryptedKeys,
        groupMembers: newGroupMembers
    })
}

// /**
//  * Decrypt a message encrypted to a given group.
//  *
//  * @param {Group} group The group containing the key
//  * @param {Implementation} oddCrypto An odd crypto instance
//  * @param {string|Uint8Array} msg The message to decrypt
//  * @returns {Promise<string>} The decrypted message
//  */
// export async function Decrypt (
//     group:Group,
//     msg:string|Uint8Array
// ):Promise<string> {
//     // get the right key from the group
//     const did = await writeKeyToDid(oddCrypto)
//     const myKey = group.encryptedKeys[await createDeviceName(did)]

//     const decryptedKey = await decryptKey(oddCrypto, myKey)

//     const decryptedMsg = await aesDecrypt(
//         ((typeof msg === 'string') ? uFromString(msg, 'base64pad') : msg),
//         decryptedKey,
//         ALGORITHM
//     )

//     const string = uToString(decryptedMsg)
//     return string
// }

/**
 * Take data in string format, and encrypt it with the given symmetric key.
 * @param key The symmetric key used to encrypt/decrypt
 * @param data The text to encrypt
 * @returns {string} Encrypted data encoded as `base64pad` string.
 */
export async function encryptContent (
    key:CryptoKey,
    data:string|Uint8Array
):Promise<string> {
    const _data = (typeof data === 'string' ? uFromString(data) : data)

    const encrypted = toString(await aesEncrypt(_data, key))

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
    exchangeKey:string|CryptoKey
):Promise<string> {
    const encryptedKey = uToString(
        new Uint8Array(await rsaOperations.encrypt(
            await aesExportKey(key),
            exchangeKey
        )),
        'base64pad'
    )

    return encryptedKey
}

/**
 * Decrypt the given encrypted (AES) key. Get your keys from indexedDB, use them
 * to decrypt the given encrypted AES key.
 *
 * @param {string} encryptedKey The encrypted key, returned by `create`:
 *   `identity.devices[name].aes`
 * @returns {Promise<CryptoKey>} The symmetric key
 */
export async function decryptKey (
    encryptedKey:string
):Promise<CryptoKey> {
    const myKey = await exchangeKey()
    const decrypted = await decryptBytes(fromString(encryptedKey), myKey.privateKey)

    const key = await importAesKey(new Uint8Array(decrypted))
    return key
}

export type SymmKeyOpts = {
    alg: ''
    length: SymmKeyLength;
    iv: ArrayBuffer;
}

export async function importKey (
    base64key:string,
    opts?:Partial<SymmKeyOpts>
):Promise<CryptoKey> {
    const buf = base64ToArrBuf(base64key)
    return window.crypto.subtle.importKey(
        'raw',
        buf,
        {
            name: opts?.alg || DEFAULT_SYMM_ALG,
            length: opts?.length || DEFAULT_SYMM_LEN,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

export async function decryptBytes (
    msg:Msg,
    key:CryptoKey|string,
    opts?: Partial<SymmKeyOpts>
): Promise<ArrayBuffer> {
    const cipherText = normalizeBase64ToBuf(msg)
    const importedKey = typeof key === 'string' ?
        await importKey(key, opts) :
        key
    const iv = cipherText.slice(0, 12)
    const cipherBytes = cipherText.slice(12)
    const msgBuff = await window.crypto.subtle.decrypt({
        name: DEFAULT_SYMM_ALG,
        iv
    }, importedKey, cipherBytes)

    return msgBuff
}

/**
 * Add a device to this identity. This is performed from a device that is
 * currently registered. You need to get the exchange key of the new
 * device somehow.
 *
 * @param {Identity} id The `Identity` instance to add to
 * @param {Implementation} crypto An instance of ODD crypto
 * @param {string} newDid The DID of the new device
 * @param {Uint8Array} exchangeKey The exchange key of the new device
 * @returns {Promise<Identity>} A new identity object, with the new device
 */
export async function addDevice (
    id:SerializedIdentity,
    newDid:DID,
    exchangeKey:CryptoKey|string,
    humanReadableName:string
):Promise<SerializedIdentity> {
    // need to decrypt the existing AES key, then re-encrypt it to the
    // new did

    const myKeys = await writeKey()
    const existingDid = await writeKeyToDid(myKeys)
    const existingDeviceName = await createDeviceName(existingDid)
    const secretKey = await decryptKey(id.devices[existingDeviceName].aes)

    let encryptedKey:string
    let exchangeString:string

    if (typeof exchangeKey === 'string') {
        encryptedKey = await encryptKey(secretKey, exchangeKey)
        exchangeString = exchangeKey
    } else if (isCryptoKey(exchangeKey)) {
        // is CryptoKey
        encryptedKey = await encryptKey(secretKey, exchangeKey)
        exchangeString = toString(
            new Uint8Array(await window.crypto.subtle.exportKey('raw', exchangeKey))
        )
    } else {
        throw new Error('Exchange key should be string or CryptoKey')
    }

    const newDeviceData:SerializedIdentity['devices'] = {}
    const name = await createDeviceName(newDid)

    newDeviceData[name] = {
        name,
        humanReadableName,
        aes: encryptedKey,
        did: newDid,
        exchange: exchangeString
    }

    const newId:SerializedIdentity = {
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
    return uToString(hashedUsername, 'base32').slice(0, 32)
}

/**
 * Sign a string. Return the signature as Uint8Array.
 * @param keystore Local keystore instance
 * @param msg The message to sign
 * @returns {Promise<Uint8Array>} The signature
 */
export async function sign (msg:Msg, charsize:CharSize):Promise<Uint8Array> {
    const key = await writeKey()

    const sig = await rsaOperations.sign(
        msg,
        key.privateKey,
        charsize || DEFAULT_CHAR_SIZE
    )

    return new Uint8Array(sig)
}

/**
 * Sign a string; return the signature as string.
 */
export async function signAsString (
    msg:string
):Promise<string> {
    const key = await writeKey()
    const sig = await rsaOperations.sign(msg, key.privateKey)
    return arrBufToBase64(sig)
}

/**
 * Check that the given signature is valid with the given message.
 */
export async function verifyFromString (
    msg:string,
    sig:string,
    signingDid:DID
):Promise<boolean> {
    const { publicKey, type } = didToPublicKey(signingDid)
    const keyType = KEY_TYPE[type]

    const isValid = await keyType.verify({
        message: uFromString(msg),
        publicKey,
        signature: uFromString(sig, 'base64pad')
    })

    return isValid
}

/**
 * Create a 32-character, DNS-friendly hash for a device. Takes either the DID
 * string or a crypto instance.
 * @param {DID|Implementation} input DID string or Crypto implementation
 * @returns {string} The 32-character hash string of the DID
 */
export async function getDeviceName (input:DID|CryptoKeyPair):Promise<string> {
    if (typeof input === 'string') {
        return createDeviceName(input)
    }

    // is crypto object
    const did = await writeKeyToDid(input)
    return createDeviceName(did)
}

/**
 * Create a `Uint8Array` from a given `base64pad` encoded string.
 *
 * @param str `base64pad` encoded string
 * @returns {Uint8Array}
 */
export function fromString (str:string) {
    return uFromString(str, 'base64pad')
}

/**
 * Convert a Uin8Array to `base64pad` encoded string.
 *
 * @param {Uint8Array} arr Binary data
 * @returns {string} String encoded as `base64pad`
 */
export function toString (arr:Uint8Array) {
    return uToString(arr, 'base64pad')
}

const EDWARDS_DID_PREFIX = new Uint8Array([0xed, 0x01])
const BLS_DID_PREFIX = new Uint8Array([0xea, 0x01])
const RSA_DID_PREFIX = new Uint8Array([0x00, 0xf5, 0x02])

const KEY_TYPE = {
    RSA: 'rsa',
    Edwards: 'ed25519',
    BLS: 'bls12-381'
} as const

const arrBufs = {
    equal: (aBuf:ArrayBuffer, bBuf:ArrayBuffer) => {
        const a = new Uint8Array(aBuf)
        const b = new Uint8Array(bBuf)
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false
        }
        return true
    }
}

export function didToPublicKey (did:string):({
    publicKey:Uint8Array,
    type:'rsa' | 'ed25519' | 'bls12-381'
}) {
    if (!did.startsWith(BASE58_DID_PREFIX)) {
        throw new Error(
            'Please use a base58-encoded DID formatted `did:key:z...`')
    }

    const didWithoutPrefix = ('' + did.substring(BASE58_DID_PREFIX.length))
    const magicalBuf = uFromString(didWithoutPrefix, 'base58btc')
    const { keyBuffer, type } = parseMagicBytes(magicalBuf)

    return {
        publicKey: new Uint8Array(keyBuffer),
        type
    }
}

/**
 * Parse magic bytes on prefixed key-buffer
 * to determine cryptosystem & the unprefixed key-buffer.
 */
function parseMagicBytes (prefixedKey:ArrayBuffer) {
    // RSA
    if (hasPrefix(prefixedKey, RSA_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(RSA_DID_PREFIX.byteLength),
            type: KEY_TYPE.RSA
        }
    // EDWARDS
    } else if (hasPrefix(prefixedKey, EDWARDS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(EDWARDS_DID_PREFIX.byteLength),
            type: KEY_TYPE.Edwards
        }
    // BLS
    } else if (hasPrefix(prefixedKey, BLS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(BLS_DID_PREFIX.byteLength),
            type: KEY_TYPE.BLS
        }
    }

    throw new Error('Unsupported key algorithm. Try using RSA.')
}

function hasPrefix (prefixedKey:ArrayBuffer, prefix:ArrayBuffer) {
    return arrBufs.equal(prefix, prefixedKey.slice(0, prefix.byteLength))
}

async function makeRSAKeypair (
    size:RsaSize,
    hashAlg:HashAlg,
    use:KeyUse
):Promise<CryptoKeyPair> {
    if (!(Object.values(KeyUse).includes(use))) {
        throw new Error('invalid key use')
    }
    const alg = use === KeyUse.Encrypt ? RSA_ALGORITHM : RSA_SIGN_ALG
    const uses:KeyUsage[] = (use === KeyUse.Encrypt ?
        ['encrypt', 'decrypt'] :
        ['sign', 'verify'])

    return window.crypto.subtle.generateKey({
        name: alg,
        modulusLength: size,
        publicExponent: publicExponent(),
        hash: { name: hashAlg }
    }, false, uses)
}

function publicExponent ():Uint8Array {
    return new Uint8Array([0x01, 0x00, 0x01])
}

export async function rsaDecrypt (
    data:Uint8Array,
    privateKey:CryptoKey|Uint8Array
):Promise<Uint8Array> {
    const arrayBuffer = await window.crypto.subtle.decrypt(
        { name: RSA_ALGORITHM },
        isCryptoKey(privateKey) ?
            privateKey :
            await importRsaKey(privateKey, ['decrypt']),
        data
    )

    return new Uint8Array(arrayBuffer)
}

export function importRsaKey (
    key:Uint8Array,
    keyUsages:KeyUsage[]
):Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
        'spki',
        key,
        { name: RSA_ALGORITHM, hash: RSA_HASHING_ALGORITHM },
        false,
        keyUsages
    )
}

export async function aesExportKey (key:CryptoKey):Promise<string> {
    const raw = await window.crypto.subtle.exportKey('raw', key)
    return arrBufToBase64(raw)
}

export async function aesDecrypt (
    encrypted:Uint8Array,
    key:CryptoKey|Uint8Array,
    iv?:Uint8Array
):Promise<Uint8Array> {
    const cryptoKey = isCryptoKey(key) ? key : await importAesKey(key)
    // we prefix the `iv` into the cipher text
    const decrypted = iv ?
        await window.crypto.subtle.decrypt({
            name: AES_GCM,
            iv
        }, cryptoKey, encrypted) :
        await decryptBytes(encrypted, cryptoKey)

    return new Uint8Array(decrypted)
}

export async function aesEncrypt (
    data:Uint8Array,
    key:CryptoKey|Uint8Array,
    iv?:Uint8Array
):Promise<Uint8Array> {
    const cryptoKey = isCryptoKey(key) ?
        key :
        await importAesKey(key)

    // prefix the `iv` into the cipher text
    const encrypted = iv ?
        await window.crypto.subtle.encrypt(
            { name: AES_GCM, iv },
            cryptoKey,
            data
        ) :
        await encryptBytes(data, cryptoKey)

    return new Uint8Array(encrypted)
}

export function importAesKey (key: Uint8Array): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
        'raw',
        key,
        {
            name: AES_GCM,
            length: SymmKeyLength.B256,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

export async function encryptBytes (
    msg:Msg,
    key:CryptoKey|string,
    opts?:Partial<{ iv }>
):Promise<ArrayBuffer> {
    const data = normalizeUtf16ToBuf(msg)
    const importedKey = typeof key === 'string' ?
        await importKey(key, opts) :
        key
    const iv = opts?.iv || randomBuf(12)
    const cipherBuf = await window.crypto.subtle.encrypt({
        name: AES_GCM,
        iv
    }, importedKey, data)

    return joinBufs(iv, cipherBuf)
}
