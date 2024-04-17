import { test } from '@nichoth/tapzero'
import { createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'
import {
    writeKeyToDid, DID,
    create, decryptKey, Identity, ALGORITHM, addDevice,
    getDeviceName, encryptTo, CurriedEncrypt,
    group, EncryptedMessage, Group, decryptMsg,
    AddToGroup, sign, signAsString, verifyFromString
} from '../src/index.js'

let identity:Identity
let rootDID:DID
let crypto:Crypto.Implementation
let alicesCrytpo:Crypto.Implementation
let rootDeviceName:string
let alicesDeviceName:string

test('create an identity', async t => {
    crypto = alicesCrytpo = await createCryptoComponent()
    rootDID = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = alicesDeviceName = await getDeviceName(rootDID)
    rootDeviceName = deviceName
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should index the symmetric key by device name')
})

test('get your device name', async t => {
    const deviceName = await getDeviceName(rootDID)
    t.equal(typeof deviceName, 'string', 'should create a device name')
    t.equal(deviceName.length, 32, 'should be 32 characters')
})

test('can use the keys', async t => {
    // test that you can encrypt & decrypt with the symmetric key
    //   saved in identity

    // first decrypt the key
    const aes = identity.devices[rootDeviceName].aes
    const decryptedKey = await decryptKey(crypto, aes)
    t.ok(decryptedKey instanceof CryptoKey,
        'decryptKey should return a CryptoKey')

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
    const id = await addDevice(identity, crypto, newDid, exchangeKey)
    t.ok(id, 'should return a new identity')
    t.ok(id !== identity, 'should return a new object, not the same one')
    const newDeviceName = await getDeviceName(newDid)
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

    const encrypted = await encryptedGroup('hello curry')
    const decrypted = await decryptMsg(crypto, encrypted)
    t.equal(decrypted, 'hello curry', 'can partially apply the function')
})

let noteToSelf:EncryptedMessage
test('encrypt a message to yourself', async t => {
    noteToSelf = await encryptTo(alice, null, 'hello self') as EncryptedMessage
    t.deepEqual(noteToSelf.creator, alice, 'has message.creator')
    t.equal(typeof noteToSelf.payload, 'string', 'should have encrypted payload')
})

test('decrypt the note to self', async t => {
    const decryptedNote = await decryptMsg(alicesCrytpo, noteToSelf)
    t.equal(decryptedNote, 'hello self', 'alice can decrypt the note')
})

test("bob cannot decrypt alice's 'note to self'", async t => {
    try {
        await decryptMsg(bobsCrypto, noteToSelf)
        t.fail("Bob should not be able to decrypt Alice's message")
    } catch (err) {
        t.ok(err, 'should throw an error for Bob')
    }
})

let encryptedMsg:EncryptedMessage
test('alice can encrypt a message to several people', async t => {
    encryptedMsg = await encryptedGroup('hello group')

    t.ok(encryptedMsg, 'should return an encrypted message')
    t.equal(encryptedMsg.creator.humanName, 'alice',
        'should have "alice" as the creator')
    t.ok(encryptedMsg.devices[bob.username], "should have bob's device")
    t.ok(encryptedMsg.devices[carol.username], "should have carol's device")

    // now decrypt
    t.equal(await decryptMsg(crypto, encryptedMsg), 'hello group',
        'alice can read the message')
    t.equal(await decryptMsg(bobsCrypto, encryptedMsg),
        'hello group', 'bob can read the message')
    t.equal(await decryptMsg(carolsCrypto, encryptedMsg),
        'hello group', 'carol can read the message')
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
        'should return the encrypted message as a string')
})

test('decrypt the encrypted group message', async t => {
    t.plan(5)

    const myKey = myGroup.encryptedKeys[alicesDeviceName]
    t.equal(typeof myKey, 'string', 'got a key')
    const decKey = await decryptKey(alicesCrytpo, myKey)
    t.ok(decKey instanceof CryptoKey,
        'decryptKey should return a CryptoKey')

    const _msg = await aesDecrypt(
        fromString(groupMsg, 'base64pad'),
        decKey,
        ALGORITHM
    )

    const msg = toString(_msg)

    t.equal(typeof msg, 'string', 'should decrypt a message')
    t.equal(msg, 'hello group', 'should decrypt to the correct value')

    const decrypted = await group.Decrypt(myGroup, alicesCrytpo, groupMsg)
    t.equal(decrypted, 'hello group', 'should decrypt the correct value')
})

test('add a new member to the group', async t => {
    t.plan(2)
    const _crypto = await createCryptoComponent()
    const fran = await create(_crypto, {
        humanName: 'fran',
    })

    const newGroup = await AddToGroup(myGroup, alicesCrytpo, fran)

    const foundFran = newGroup.groupMembers.find(person => {
        return person.username === fran.username
    })

    t.ok(foundFran, 'Fran should be in the group members list')
    t.ok(newGroup.encryptedKeys[fran.username],
        "Fran's device should be in the group")
})

test('encrypt/decrypt a message', async t => {
    const decrypted = await decryptMsg(alicesCrytpo, encryptedMsg)
    t.equal(decrypted, 'hello group',
        'Alice can decrypt a message that she encrypted')

    const newMsg = await encryptTo(alice, [bob], 'hello bob') as EncryptedMessage
    t.ok(newMsg.payload, 'Encrypted message should have payload')

    const newDecryptedMsg = await decryptMsg(bobsCrypto, newMsg)

    t.equal(newDecryptedMsg, 'hello bob',
        'Bob can decrypt a message encrypted to bob')
})

test('sign and verify', async t => {
    const { keystore } = crypto
    const sig = await sign(keystore, 'hello')
    t.ok(sig instanceof Uint8Array, 'should return a Uint8Array')
    const sigStr = await signAsString(keystore, 'hello')
    const isValid = await verifyFromString(
        'hello',
        sigStr,
        await writeKeyToDid(crypto)
    )
    t.equal(isValid, true, 'should validate a valid signature')
})
