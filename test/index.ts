import { test } from '@socketsupply/tapzero'
import { writeKeyToDid } from '@ssc-hermes/util'
import { components, createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'
import {
    create, decryptKey, Identity, ALGORITHM, add,
    createDeviceName
} from '../dist/index.js'

let identity:Identity
let rootDid:string
let crypto:Crypto.Implementation
let rootDeviceName:string

test('create an identity', async t => {
    crypto = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = await createDeviceName(rootDid)
    rootDeviceName = deviceName
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should map the symmetric key, indexed by device name')
})

test('can use the keys', async t => {
    // test that you can encrypt & decrypt with the symmetric key
    //   saved in identity

    // first decrypt the key
    // const exchange = identity.devices[rootDeviceName].exchange
    const aes = identity.devices[rootDeviceName].aes
    const decryptedKey = await decryptKey(crypto, aes)
    // const decryptedKey = await decryptKey(crypto, exchange)
    t.ok(decryptedKey instanceof CryptoKey, 'decryptKey should return a CryptoKey')

    // now use it to encrypt a string
    const encryptedString = await aesEncrypt(
        fromString('hello'), decryptedKey, ALGORITHM)
    t.ok(encryptedString instanceof Uint8Array,
        'should return a Uint8Array when you encrypt a string')

    // now decrypt the string
    const decrypted = toString(
        await aesDecrypt(encryptedString, decryptedKey, ALGORITHM)
    )

    t.equal(decrypted, 'hello', 'can decrypt the original string')
})

test('add a device to the identity', async t => {
    const _crypto = await createCryptoComponent()
    const newDid = await writeKeyToDid(_crypto)
    const exchangeKey = await _crypto.keystore.publicExchangeKey()
    const id = await add(identity, crypto, newDid, exchangeKey)
    t.ok(id, 'should return a new identity')
    const newDeviceName = await createDeviceName(newDid)
    t.ok(identity.devices[newDeviceName],
        'new identity should have a new device with the expected name')
    t.ok(identity.devices[rootDeviceName],
        'identity should still have the original device')
})

test('cannot decrypt the symmetric key with the wrong keys', async t => {
    // create new keys
    const crypto = await createCryptoComponent()

    try {
        await decryptKey(
            crypto,
            (identity.devices['bad-name']).aes
        )
        t.fail('should throw an error when the device name is invalid')
    } catch (err) {
        t.ok(err, 'should throw an error when the device name is invalid')
    }

    try {
        const deviceKeys = identity.devices[rootDeviceName]
        await decryptKey(crypto, deviceKeys.aes)
        t.fail('should throw an error when decrypting with the wrong keys')
    } catch (err) {
        t.ok(err.cause.toString().includes('decoding error'),
            'should throw "decoding error"')
        t.ok(err, 'should throw an error when decrypting with the wrong keys')
    }
})
