import { test } from '@socketsupply/tapzero'
import { writeKeyToDid } from '@ssc-half-light/util'
import { components, createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'
import {
    create, decryptKey, Identity, ALGORITHM, add,
    createDeviceName, encryptTo, CurriedEncrypt,
    group,
    EncryptedMessage,
    Group
} from '../dist/index.js'

let identity:Identity
let rootDid:string
let crypto:Crypto.Implementation
let alicesCrytpo:Crypto.Implementation
let rootDeviceName:string
let alicesDeviceName:string

test('create an identity', async t => {
    crypto = alicesCrytpo = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = alicesDeviceName = await createDeviceName(rootDid)
    rootDeviceName = deviceName
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should map the symmetric key, indexed by device name')
})

test('get your device name', async t => {
    const deviceName = await createDeviceName(rootDeviceName)
    t.equal(typeof deviceName, 'string', 'should create a device name')
    t.equal(deviceName.length, 32, 'should be 32 characters')
})

test('can use the keys', async t => {
    // test that you can encrypt & decrypt with the symmetric key
    //   saved in identity

    // first decrypt the key
    const aes = identity.devices[rootDeviceName].aes
    const decryptedKey = await decryptKey(crypto, aes)
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
    const newCrypto = await createCryptoComponent()

    try {
        await decryptKey(
            newCrypto,
            (identity.devices['bad-name']).aes
        )
        t.fail('should throw an error when the device name is invalid')
    } catch (err) {
        t.ok(err, 'should throw an error when the device name is invalid')
    }

    try {
        const deviceKeys = identity.devices[rootDeviceName]
        await decryptKey(newCrypto, deviceKeys.aes)
        t.fail('should throw an error when decrypting with the wrong keys')
    } catch (err) {
        t.ok(err, 'should throw an error when decrypting with the wrong keys')
        t.ok((err as Error).toString().includes('operation-specific reason'),
            'should have the expected message')
    }
})

let alice:Identity, bob:Identity, carol:Identity
let bobsCrypto:Crypto.Implementation, carolsCrypto:Crypto.Implementation
let encryptedGroup:CurriedEncrypt

test('can partially apply the `encryptTo` function', async t => {
    alice = identity
    bobsCrypto = await createCryptoComponent()
    bob = await create(bobsCrypto, {
        humanName: 'bob'
    })
    carolsCrypto = await createCryptoComponent()
    carol = await create(carolsCrypto, {
        humanName: 'carol'
    })

    // (msg creator, recipients[])
    encryptedGroup = await encryptTo(alice, [
        bob,
        carol
    ]) as CurriedEncrypt

    t.equal(typeof encryptedGroup, 'function',
        "should return a function if you don't pass a message")
})

let encryptedMsg:EncryptedMessage
test('alice can encrypt a message to several people', async t => {
    encryptedMsg = await encryptedGroup('hello group')

    t.ok(encryptedMsg, 'should return an encrypted message')
    t.equal(encryptedMsg.creator.humanName, 'alice',
        'should have "alice" as the creator')
    t.ok(encryptedMsg.devices[bob.username], "should have bob's device")
    t.ok(encryptedMsg.devices[carol.username], "should have carol's device")

    // @TODO
    // now decrypt
    // t.equal(ddd(crypto, encryptedMsg), 'hello group', 'alice can read the message')
    // t.equal(ddd(bobsCrypto, encryptedMsg), 'hello group', 'bob can read the message')
    // t.equal(ddd(carolsCrypto, encryptedMsg), 'hello group', 'carol can read the message')
})

let groupMsg:string
let myGroup:Group
test('create an encrypted group', async t => {
    const key = await decryptKey(alicesCrytpo, encryptedMsg.devices[alicesDeviceName])
    myGroup = await group(alice, [bob, carol], key)

    t.ok(myGroup.encryptedKeys, 'should have encryptedKeys on the group')
    t.ok(myGroup.encryptedKeys[alicesDeviceName],
        "should have alice's device in the keys")

    groupMsg = await myGroup('hello group')
    t.ok(groupMsg, 'should create an encrypted message')
    t.equal(typeof groupMsg, 'string',
        'should return encrypted message as a string')
})

test('decrypt the encrypted group message', async t => {
    const msg = await myGroup.decrypt(alicesCrytpo, myGroup, groupMsg)
    t.equal(msg, 'hello group', 'can decrypt an encrypted group message')
})
