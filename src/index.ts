import { fromString, toString } from 'uint8arrays'
import { aesGenKey, aesExportKey, rsa, importAesKey } from
    '@oddjs/odd/components/crypto/implementation/browser'
import * as BrowserCrypto from '@oddjs/odd/components/crypto/implementation/browser'
import { SymmAlg } from 'keystore-idb/types.js'
import type { Crypto } from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'

export interface Device {
    name:string,
    did:string,
    aes:string,  /* the symmetric key for this account, encrypted to the
      exchange key for this device */
    exchange:string
}

export interface Identity {
    humanName:string
    username:string,
    rootDid:string,
    devices:Record<string, Device>
}

export const ALGORITHM = SymmAlg.AES_GCM

/**
 * Create a new `identity`. This tracks a set of exchange keys by device.
 * This depends on the `crypto` interface of `odd`. That is the keystore that
 * holds the keys for your device. This creates a public record, meaning that
 * we can store this anywhere, whereas the private keys are non-exportable,
 * stored only on-device
 * @param crypto Fission crypto implementation for the current device
 * @param opts { humanName } The human-readable name of this identity
 * @returns {Identity}
 */
export async function create (
    crypto:Crypto.Implementation,
    opts:{ humanName:string }
):Promise<Identity> {
    const rootDid = await writeKeyToDid(crypto)  // this is equal to agentDid()
    const deviceName = await createDeviceName(rootDid)
    const { humanName } = opts

    // this is the private aes key for this ID
    const key = await aesGenKey(SymmAlg.AES_GCM)
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
        rootDid,
        humanName,
        devices: initialDevices
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
 * @param {string} encryptedKey The encrypted key, returned by `create`
 * -- identity.devices[name].aes
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
 * Add a device to this identity. This is performed from a device that is currently
 * registered. You need to get the exchange key of the new device somehow.
 * @param {Identity} id The `Identity` instance to add to
 * @param {Crypto.Implementation} crypto An instance of Fission's crypto
 * @param {string} newDid The DID of the new device
 * @param {Uint8Array} exchangeKey The exchange key of the new device
 */
export async function add (
    id:Identity,
    crypto:Crypto.Implementation,
    newDid:string,
    exchangeKey:Uint8Array,
) {
    // need to decrypt the existing AES key, then re-encrypt it to the
    // new did

    // this is all happening on a device that is already authed

    const existingDid = await writeKeyToDid(crypto)
    const existingDeviceName = await createDeviceName(existingDid)
    const secretKey = await decryptKey(crypto,
        id.devices[existingDeviceName].aes)

    // ??? how to get the exchange key of the new device ???
    const encrypted = await encryptKey(secretKey, exchangeKey)
    const newDeviceData:Identity['devices'] = {}
    const name = await createDeviceName(newDid)
    newDeviceData[name] = {
        name,
        aes: encrypted,
        did: newDid,
        exchange: arrToString(exchangeKey)
    }

    const newId:Identity = {
        ...id,
        devices: Object.assign(id.devices, newDeviceData)
    }

    return newId
}

export async function createDeviceName (did:string) {
    const normalizedDid = did.normalize('NFD')
    const hashedUsername = await BrowserCrypto.sha256(
        new TextEncoder().encode(normalizedDid)
    )
    return toString(hashedUsername, 'base32').slice(0, 32)
}

function arrToString (arr:Uint8Array) {
    return toString(arr, 'base64pad')
}
