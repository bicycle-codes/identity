# identity ![tests](https://github.com/ssc-hermes/identity/actions/workflows/nodejs.yml/badge.svg)

This is an object representing a user. An Identity object contains a collection of "devices", where each device has several keypairs. This depends on each device having a [keystore](https://github.com/fission-codes/keystore-idb) that stores the private keys.

We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device. So the symmetric key is encrypted with the public key of each device.

Each device has a primary keypair used for signing, which is `did` here, and also an "exchange" keypair, which is used for encrypting & decrypting things. In the `Device` record there is also an index `aes`, which is the symmetrical key that has been encrypted to the device's exchange key.

see also, [keystore as used in crypto component](https://github.com/oddsdk/ts-odd/blob/main/src/components/crypto/implementation/browser.ts#L8) 

Devices are indexed by a sufficiently random key, created by calling `createDeviceName` with the primary did for the device.

------------------------

Sending a private messaesge to an identity would mean encrypting a message with a new symmetric key. That means encrypting `n` versions of the symmetric key, one for each device in the other identity.

So there you can think of it like one conversation = 1 symmetric key. The person initiating the conversation needs to know the exchange keys of the other party.

## storage
This module is agnostic about storage. You would want to save the identity object to a database or something, which is easy to do because keys are encrypted "at rest". Any device record pairs with a `keystore` instance on the device.

---------------------------

## install
```
npm i -S @ssc-hermes/identity
```

## types

### Identity
```ts
interface Identity {
    humanName:string,  // a human readble name for the identity
    username:string,  // the random string for the root device. Not human-readable
    rootDid:string  // The DID of the first device to use this identity
    devices:Record<string, Device>  // a map of devices in this identity
}
```

### Device
```ts
interface Device {
    name:string,  // the random string for this device
    did:string,  // primary DID for the device. Used to sign things
    aes:string,  /* the symmetric key for this account, encrypted to the
        exchange key for this device */
    exchange:string  // public key used for encrypting & decrypting
}
```

-------

## test
Tests run in node because we are using `@ssc-hermes/node-components`.

```
npm test
```

## example

### Create an identity object
```js
import { test } from 'tapzero'
import { build } from '@ucans/ucans'
import { writeKeyToDid } from '@ssc-hermes/util'
import { create, createDeviceName } from '@ssc-hermes/identity'

test('create an identity', async t => {
    // crypto is from odd `program.components.crypto`
    crypto = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = await createDeviceName(rootDid)
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should map the symmetric key, indexed by device name')
})
```

### Use the symmetric key to encrypt and decrypt something

```js
import { test } from 'tapzero'
import { decryptKey, ALGORITHM } from '@ssc-hermes/identity'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'

test('can use the keys', async t => {
    // test that you can encrypt & decrypt with the symmetric key
    //   saved in identity

    // first decrypt the key
    const decryptedKey = await decryptKey(identity.key[rootDid], crypto)
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
```

### add a new device to this identity
This adds a new DID to this identity.

```ts
import { test } from '@socketsupply/tapzero'
import { writeKeyToDid } from '@ssc-hermes/util'

test('add a device to the identity', async t => {
    // create a new `crypto`, serving as the new device
    const _crypto = await createCryptoComponent()
    const newDid = await writeKeyToDid(_crypto)
    const exchangeKey = await _crypto.keystore.publicExchangeKey()
    // must be added with the existing device/crypto instance,
    // because we need to decrypt the AES key in order to encrypt it to the new
    //   device
    // pass in the existing `identity` object,
    //   return a new identity
    const id = await add(identity, crypto, newDid, exchangeKey)
    t.ok(id, 'should return a new identity')
    const newDeviceName = await createDeviceName(newDid)
    t.ok(identity.devices[newDeviceName],
        'new identity should have a new device with the expected name')
    t.ok(identity.devices[rootDeviceName],
        'identity should still have the original device')
})
```
