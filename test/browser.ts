import { type EncryptedMessage, Identity } from '../src/index.js'
import { test } from '@bicycle-codes/tapzero'
import { get } from 'idb-keyval'

let alice:Identity
test('Identity.create', async t => {
    const id = alice = await Identity.create({
        humanName: 'alice',
        humanReadableDeviceName: 'phone'
    })

    t.ok(id instanceof Identity, 'should return a new identity')

    const key = await get<CryptoKeyPair>(id.ENCRYPTION_KEY_NAME)
    t.ok(key, 'should store a key in indexedDB')
    t.ok(key?.publicKey, 'should create an asymmetric keypair')
    t.ok(key?.privateKey, 'should create an asymmetric keypair')

    const signingKey = await get<CryptoKeyPair>(id.SIGNING_KEY_NAME)
    t.ok(signingKey?.publicKey, 'should create an asymmetric signing keypair')
    t.ok(signingKey?.privateKey, 'should create an asymmetric signing keypair')
})

let msg:EncryptedMessage
test('encrypt a message', async t => {
    msg = await alice.encryptMsg('hello world')
    t.ok(msg, 'should return something')
    t.ok(msg.devices[alice.rootDeviceName],
        'should encrypt the message to its author')
})

test('decrypt the message', async t => {
    const decrypted = await alice.decryptMsg(msg)
    t.equal(decrypted, 'hello world', 'should decrypt the message')
})
