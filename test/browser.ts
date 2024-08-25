import * as uArrs from 'uint8arrays'
import { test } from '@bicycle-codes/tapzero'
import { get } from 'idb-keyval'
import {
    type EncryptedMessage,
    Identity,
    encryptKey,
    aesExportKey,
    decryptKey,
    aesGenKey,
    aesDecrypt,
    encryptContent,
    exportPublicKey,
    verifyFromString
} from '../src/index.js'
import { AES_GCM } from '../src/constants.js'

let alice:Identity
test('Identity.create', async t => {
    const id = alice = await Identity.create({
        humanName: 'alice',
        humanReadableDeviceName: 'phone'
    })

    t.ok(id instanceof Identity, 'should return a new identity')

    const key = await get<CryptoKeyPair>(Identity.ENCRYPTION_KEY_NAME)
    t.ok(key, 'should store a key in indexedDB')
    t.ok(key?.publicKey, 'should create an asymmetric keypair')
    t.ok(key?.privateKey, 'should create an asymmetric keypair')

    const signingKey = await get<CryptoKeyPair>(Identity.SIGNING_KEY_NAME)
    t.ok(signingKey?.publicKey, 'should create an asymmetric signing keypair')
    t.ok(signingKey?.privateKey, 'should create an asymmetric signing keypair')
})

test('getDeviceName', async t => {
    const name = await alice.getDeviceName()
    t.equal(typeof name, 'string', 'should return the device name')
    t.equal(name.length, 32, 'should be 32 characters')
})

let encryptedString:string
test('encrypt content', async t => {
    const encrypted = encryptedString = await encryptContent(
        alice.aes,
        'hello'
    )
    t.equal(typeof encrypted, 'string', 'should return a string')

    const dec = await aesDecrypt(
        uArrs.fromString(encrypted, 'base64pad'),
        alice.aes
    )
    t.equal(uArrs.toString(dec), 'hello', 'should decrypt the text')
})

test('aes decrypt', async t => {
    const decrypted = await aesDecrypt(
        uArrs.fromString(encryptedString, 'base64pad'),
        alice.aes
    )
    t.equal(uArrs.toString(decrypted), 'hello', 'should decrypt the text')
})

let key:CryptoKey
let encryptedKey:string
let plaintextKey:string
test('encrypt key', async t => {
    key = await aesGenKey({ alg: AES_GCM, length: 256 })
    const exported = await aesExportKey(key)
    plaintextKey = uArrs.toString(exported, 'base64pad')
    encryptedKey = await encryptKey(key, alice.encryptionKey)
    t.ok(encryptedKey, 'should encrypt a key')
})

test('decrypt key', async t => {
    const decryptedKey = await decryptKey(encryptedKey, alice.encryptionKey)
    t.ok(decryptedKey instanceof CryptoKey, 'should return a key')
    const exported = await aesExportKey(decryptedKey)
    t.equal(uArrs.toString(exported, 'base64pad'), plaintextKey,
        'should decrypt to the the same key')
})

let msg:EncryptedMessage
test('encrypt a message', async t => {
    msg = await alice.encryptMsg('hello world')
    t.equal(typeof msg.payload, 'string', 'should create a message object')
    t.ok(msg.devices[alice.rootDeviceName],
        'should encrypt the message to its author')
})

test('decrypt the message text', async t => {
    const encrypted = msg.payload
    const encKey = msg.devices[alice.rootDeviceName]
    const decKey = await decryptKey(encKey, alice.encryptionKey)
    const decText = await aesDecrypt(
        uArrs.fromString(encrypted, 'base64pad'),
        decKey
    )
    t.equal(uArrs.toString(decText), 'hello world', 'should decrypt the text')
})

test('decrypt the message', async t => {
    const decrypted = await alice.decryptMsg(msg)
    t.equal(decrypted, 'hello world',
        'should decrypt the message to the right text')
})

test('load a saved identity', async t => {
    Identity.save(await alice.serialize())
    const alice2 = await Identity.init()
    const alice2Key = await exportPublicKey(alice2.signingKey)
    t.equal(typeof alice2Key, 'string', 'should return a string')
    const aliceKey = await exportPublicKey(alice.signingKey)
    t.equal(aliceKey, alice2Key, 'should load the same keys from storage')
})

let sig:string
test('sign a message', async t => {
    const _sig = await alice.sign('hello again')
    t.ok(_sig instanceof Uint8Array, 'should return a uint8array')
    sig = uArrs.toString(_sig, 'base64pad')
})

test('verify the signature', async t => {
    const valid = await verifyFromString('hello again', sig, alice.DID)
    t.equal(valid, true, 'should verify a valid signature')
    t.equal(await verifyFromString('bad one', sig, alice.DID), false,
        'should not verify an invalid signature')
})

let bob:Identity
let msgToBob:EncryptedMessage
test('encrypt a message to another identity', async t => {
    bob = await Identity.create({
        humanName: 'bob',
        humanReadableDeviceName: 'computer'
    })

    const msg = msgToBob = await alice.encryptMsg('hello bob', [
        await bob.serialize()
    ])
    t.ok(msg.payload, 'should return a message')
    t.ok(msg.devices[bob.rootDeviceName],
        'should have bob in the list of recipients')
})

test('decrypt a message from another person', async t => {
    const decrypted = await bob.decryptMsg(msgToBob)
    t.equal(decrypted, 'hello bob', 'should decrypt the message')
})

let alice3:Identity
test('add a new device', async t => {
    alice3 = await Identity.create({
        humanName: 'alice',
        humanReadableDeviceName: 'computer'
    })

    const workComputer = await Identity.createDeviceRecord({
        humanReadableName: 'work computer'
    })

    await alice.addDevice(workComputer)

    t.ok(alice.devices[workComputer.name],
        'alice Identity should have the new device record')
})

test('alice can decrypt messages with any device', async t => {
    const newMessage = await alice.encryptMsg('encrypting things')
    const plaintext = await alice3.decryptMsg(newMessage)
    t.equal(plaintext, 'encrypting things',
        'work computer can decrypt a message encrypted with phone')
})
