import { Ucan } from '@ucans/ucans'
// import { toString } from 'uint8arrays/to-string'
// import { path as Path } from '@oddjs/odd'
// import * as Identifiers from '@oddjs/odd/common/identifiers'
import { aesGenKey, aesExportKey, rsa } from
    '@oddjs/odd/components/crypto/implementation/browser'
// import { didToPublicKey } from '@oddjs/odd/did/transformers'
// import { publicKeyToDid } from '@oddjs/odd/did/transformers'
import { SymmAlg } from 'keystore-idb/types.js'
import type { Crypto } from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'
// import * as BrowserCrypto from '@oddjs/odd/components/crypto/implementation/browser'
// import { webcrypto } from 'one-webcrypto'
// BrowserCrypto.aesGenKey
// BrowserCrypto.did.

interface Identity {
    username:string,
    key:Record<string, string>,
    ucan:Ucan,
    rootDid
}

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
    const encryptedKey = rsa.encrypt(exported, exchangeKey)
    initialKey[rootDid] = encryptedKey

    return {
        username,
        rootDid,
        key: initialKey,
        ucan
    }
}

// export async function create (
//     crypto:Crypto.Implementation,
//     opts:{username:string, ucan:Ucan}
// ):Promise<Identity> {
//     const rootDid = await writeKeyToDid(crypto)
//     const { username, ucan } = opts
//     const initialKeys = {}
//     // const key = await aesGenKey(SymmAlg.AES_GCM)
//     const keyName = await identifier(crypto, rootDid)
//     const exported = await crypto.keystore.exportSymmKey(keyName)
//     // const exported = await aesExportKey(key)

//     // @TODO -- encrypt this key to the DID
//     // `key` is indexed by the write key DID, that way you can get it via
//     //   `await agentDID()`
//     initialKeys[rootDid] = toString(exported, 'base64')

//     // const [pubKey, ksAlg] = await Promise.all([
//     //     crypto.keystore.publicWriteKey(),
//     //     crypto.keystore.getAlgorithm()
//     // ])
//     // const pubKey = didToPublicKey(crypto, rootDid)

//     // const rootDid = await publicKeyToDid(crypto, pubKey, ksAlg)

//     // const exchangeKey = await crypto.keystore.publicExchangeKey()
//     // // const writeKey = await crypto.keystore.publicWriteKey()
//     // const symmKey = await crypto.keystore.exportSymmKey()

//     return {
//         username,
//         rootDid,
//         key: initialKeys,
//         ucan
//     }
// }

// function identifier (crypto: Crypto.Implementation, accountDID: string):
// Promise<string> {
//     const path = Path.directory(Path.RootBranch.Private)
//     return Identifiers.readKey({ crypto, path, accountDID })
// }
