import { fromString, toString } from 'uint8arrays'
import { aesGenKey, aesExportKey, rsa, importAesKey } from
    '@oddjs/odd/components/crypto/implementation/browser'
import * as BrowserCrypto from '@oddjs/odd/components/crypto/implementation/browser'
import { SymmAlg } from 'keystore-idb/types.js'
import type { Crypto } from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'

export interface Identity {
    humanName:string
    username:string,
    rootDid:string,
    devices:Record<string, string>,
}

export const ALGORITHM = SymmAlg.AES_GCM

/**
 * Create a new `identity`. This tracks a set of exchange keys by device.
 * @param crypto Fission crypto implementation
 * @param opts { humanName } The human-readable name of this identity
 * @returns {Identity}
 */
export async function create (
    crypto:Crypto.Implementation,
    opts:{ humanName:string }
):Promise<Identity> {
    const rootDid = await writeKeyToDid(crypto)  // this is equal to agentDid()
    const deviceName = await createDeviceName(rootDid)
    const username = deviceName
    const { humanName } = opts

    const key = await aesGenKey(SymmAlg.AES_GCM)
    const exported = await aesExportKey(key)
    const exchangeKey = await crypto.keystore.publicExchangeKey()

    // i think only RSA is supported currently
    const encryptedKey = toString(
        await rsa.encrypt(exported, exchangeKey),
        'base64pad'
    )

    const initialKeys = {}
    initialKeys[deviceName] = encryptedKey

    return {
        username,
        rootDid,
        humanName,
        devices: initialKeys
    }
}

/**
 * Encrypt a given symmetric key to the given exchange key
 * @param key The symmetric key
 * @param exchangeKey The exchange key to encrypt *to*
 * @returns the encrypted key, encoded as 'base64pad'
 */
async function encryptKey (key:CryptoKey, exchangeKey:Uint8Array) {
    const encryptedKey = toString(
        await rsa.encrypt(await aesExportKey(key), exchangeKey),
        'base64pad'
    )

    return encryptedKey
}

/**
 * Decrypt the given encrypted key
 * @param {string} encryptedKey The encrypted key, as seen returned by `create`
 * -- identity.key['did:key:...']
 * @param {Crypto.Implementation} crypto An instance of Fission's crypto
 * @returns {Promise<CryptoKey>} The symmetric key
 */
export async function decryptKey (crypto:Crypto.Implementation, encryptedKey:string)
:Promise<CryptoKey> {
    const decrypted = await crypto.keystore.decrypt(
        fromString(encryptedKey, 'base64pad'))

    const key = await importAesKey(decrypted, SymmAlg.AES_GCM)

    return key
}

// the existing devices are the only places that can decrypt the key
// must call `add` from an existing device

/**
 * Add a DID to this identity. This is performed from a device that is currently
 * registered.
 * @param {Identity} id The `Identity` instance to add to
 * @param {string} newDid The DID of the new device
 * @param {Uint8Array} exchangeKey The exchange key of the new device
 * @param {Crypto.Implementation} crypto An instance of Fission's crypto
 */
export async function add (
    id:Identity,
    crypto:Crypto.Implementation,
    newDid:string,
    exchangeKey:Uint8Array,
) {
    // need to decrypt the existing symm key, then re-encrypt it to the
    // new did

    // this is all happening on a device that is already authd

    const existingDid = await writeKeyToDid(crypto)
    const existingDeviceName = await createDeviceName(existingDid)
    const secretKey = await decryptKey(crypto, id.devices[existingDeviceName])

    // ??? how to get the exchange key of the new device ???
    const encrypted = await encryptKey(secretKey, exchangeKey)
    const newDeviceData = {}
    newDeviceData[await createDeviceName(newDid)] = encrypted

    const newId:Identity = {
        ...id,
        devices: Object.assign(id.devices, newDeviceData)
    }

    return newId
}

async function createDeviceName (did:string) {
    const normalizedDid = did.normalize('NFD')
    const hashedUsername = await BrowserCrypto.sha256(
        new TextEncoder().encode(normalizedDid)
    )
    return toString(hashedUsername, 'base32').slice(0, 32)
}
