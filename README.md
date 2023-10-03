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
This is storage agnostic. You would want to save the identity object to a database or something, which is easy to do because keys are encrypted "at rest". Any device record pairs with a `keystore` instance on the device.

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

```ts
import { test } from '@socketsupply/tapzero'
import { writeKeyToDid } from '@ssc-hermes/util'
import { components, createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'
import {
    create, decryptKey, Identity, ALGORITHM, add,
    createDeviceName, encryptTo, CurriedEncrypt
} from '@ssc-hermes/identity'
```

### create an identity
```ts
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
```

### use the keys to encrypt and decrypt
```ts
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
```

### add a device
We need to pass in the `crypto` object from the original identity, because we need to decrypt the secret key, then re-encrypt it to the new device:
```js
// decrypt the AES key
const secretKey = await decryptKey(
    crypto,
    id.devices[existingDeviceName].aes
)
```

We need to call this function from the existing device because we need to decrypt the AES key, then re-encrypt it to the public exchange key of the new device. That means we need to get the `exchangeKey` of the new device somehow.

```js
test('add a device to the identity', async t => {
    const device2Crypto = await createCryptoComponent()
    const newDid = await writeKeyToDid(device2Crypto)
    const exchangeKey = await device2Crypto.keystore.publicExchangeKey()

    // add the device. Returns the ID with the new device added
    // NOTE this takes params from the original keypair -- `crypto`
    //  and also params from the new keypair -- `exchangeKey`
    const id = await add(identity, crypto, newDid, exchangeKey)

    t.ok(id, 'should return a new identity')
    const newDeviceName = await createDeviceName(newDid)
    t.ok(identity.devices[newDeviceName],
        'new identity should have a new device with the expected name')
    t.ok(identity.devices[rootDeviceName],
        'identity should still have the original device')
})
```


### get your device's name

```js
import { createDeviceName } from '@ssc-hermes/identity'
// create an odd program...
const myDid = await program.agentDID()
const myDeviceName = createDeviceName(myDid)
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```
