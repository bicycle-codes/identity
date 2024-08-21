import {
    type EncryptedMessage,
    Identity,
    encryptKey,
    aesExportKey,
    decryptKey,
    aesGenKey,
    aesDecrypt,
    encryptContent
} from '../src/index.js'
import * as uArrs from 'uint8arrays'
import { AES_GCM } from '../src/constants.js'
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
