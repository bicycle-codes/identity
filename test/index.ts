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
    t.ok(decryptedKey instanceof CryptoKey, 'decryptKey should return a CryptoKey')

    // now use it to encrypt a string
    const encrypted = await aesEncrypt(fromString('hello'), decryptedKey, ALGORITHM)
    t.ok(encrypted instanceof Uint8Array,
        'should return a Uint8Array when you encrypt a string')

    // now decrypt the string
    const decrypted = toString(
        await aesDecrypt(encrypted, decryptedKey, ALGORITHM)
    )

    t.equal(decrypted, 'hello', 'can decrypt the original string')
})

test('cannot decrypt the symmetric key with the wrong keys', async t => {
    const crypto = await createCryptoComponent()

    try {
        const readableKey = await decryptKey(identity.key[rootDid], crypto)
        t.ok(readableKey)
        t.fail('should throw an error with the wrong keys')
    } catch (err) {
        t.ok(err, 'should throw an error because the keys are invalid')
    }
})
