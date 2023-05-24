import { test } from 'tapzero'
import { build, EdKeypair } from '@ucans/ucans'
import { writeKeyToDid } from '@ssc-hermes/util'
import { components, createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt, aesExportKey } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString } from 'uint8arrays/from-string'
import { toString } from 'uint8arrays/to-string'
import { create, decryptKey, Identity, ALGORITHM } from '../dist/index.js'

let identity:Identity
let rootDid:string
let crypto:Crypto.Implementation

test('create an identity', async t => {
    const keypair = await EdKeypair.create()
    crypto = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        username: 'alice123',
        ucan: await build({
            audience: rootDid,
            issuer: keypair
        })
    })

    t.ok(identity, 'should return a new identity')
    t.ok(identity.key[rootDid], 'should map the symmetric key, indexed by device DID')
    t.ok(identity.ucan, 'should incldue the UCAN')
})

let plainKey:CryptoKey
test('can use the keys', async t => {
    // test that you can encrypt & decrypt with the symmetric key
    //   saved in identity

    // first decrypt the key
    const encryptedKey = identity.key[rootDid]
    const decryptedKey = plainKey = await decryptKey(encryptedKey, crypto)

    t.ok(decryptedKey instanceof CryptoKey, 'should return a CryptoKey')

    // now use it to encrypt a string
    const encrypted = await aesEncrypt(fromString('hello'), decryptedKey, ALGORITHM)
    t.ok(encrypted, 'should return something')

    // now decrypt the string
    const decrypted = toString(
        await aesDecrypt(encrypted, decryptedKey, ALGORITHM)
    )

    t.equal(decrypted, 'hello', 'should decrypt the original string')
})

// check that it is broken if you can't decrypt the key
test('cannot decrypt the symmetric key with the wrong keys', async t => {
    const crypto = await createCryptoComponent()

    try {
        const readableKey = await decryptKey(identity.key[rootDid], crypto)
        const extracted = toString(await aesExportKey(readableKey), 'base64pad')
        const otherExtracted = toString(await aesExportKey(plainKey), 'base64pad')
        console.log('extracted', extracted)
        console.log('other extracted', otherExtracted)
        t.ok(!(extracted === otherExtracted),
            'should not decrypt the key with a different crypto object')
    } catch (err) {
        t.ok(err, 'should throw an error because the crypto object is different')
    }
})
