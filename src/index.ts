import { Ucan } from '@ucans/ucans'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'
import { aesGenKey, aesExportKey, rsa, importAesKey } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { SymmAlg } from 'keystore-idb/types.js'
import type { Crypto } from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'

export interface Identity {
    username:string,
    key:Record<string, string>,
    ucan:Ucan,
    rootDid
}

export const ALGORITHM = SymmAlg.AES_GCM

export async function create (
    crypto:Crypto.Implementation,
    opts:{username:string, ucan:Ucan}
):Promise<Identity> {
    const rootDid = await writeKeyToDid(crypto)  // this is equal to agentDid()
    const { username, ucan } = opts
    const initialKey = {}
    const key = await aesGenKey(SymmAlg.AES_GCM)
    const exported = await aesExportKey(key)
    const exchangeKey = await crypto.keystore.publicExchangeKey()

    // i think only RSA is supported currently
    const encryptedKey = toString(
        await rsa.encrypt(exported, exchangeKey),
        'base64pad'
    )
    initialKey[rootDid] = encryptedKey

    return {
        username,
        rootDid,
        key: initialKey,
        ucan
    }
}

export async function decryptKey (encryptedKey:string, crypto:Crypto.Implementation)
:Promise<CryptoKey> {
    const decrypted = await crypto.keystore.decrypt(
        fromString(encryptedKey, 'base64pad'))

    const key = await importAesKey(decrypted, SymmAlg.AES_GCM)

    return key
}
