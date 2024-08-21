# identity 
![tests](https://github.com/bicycle-codes/identity/actions/workflows/nodejs.yml/badge.svg)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![types](https://img.shields.io/npm/types/@bicycle-codes/identity?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://nichoth.github.io/badge/license-polyform-shield.svg)](LICENSE)

Use [non-extractable keypairs](https://github.com/fission-codes/keystore-idb/blob/fb8fab2f0346ab6681b2f93913209939dd42d19f/src/ecc/keys.ts#L17) as user identity.


-----------

Use the webcrypto API to create a keypair representing a user.

All encryption is via [AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#algorithm).

All asymmetric crypto is using RSA, because we are waiting for more browsers to support ECC.

## conceptual view

Create two keypairs -- 1 for signing and 1 for encrypting, and store them in `indexedDB` in the browser. [All keypairs here are "non-extractable"](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#extractable), so you are never able to read the private key, but they still persist indefinitely in indexedDB.

We can do passwordless user ID, using something like [UCAN](https://github.com/ucan-wg/ts-ucan) to link multiple devices if you want.


## E2E encryption

We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device that should be able to read the message. So the symmetric key is encrypted with the public key of each device.

Devices are indexed by a sufficiently random key, created by calling [createDeviceName](./src/index.ts#L940) with the primary did for the device.

------------------------

Sending a private message to an identity would mean encrypting a message with a new symmetric key, then encrypting `n` versions of the symmetric key, one for each device in the other identity.

You can think of it like one conversation = 1 symmetric key. The person initiating the conversation needs to know the encryption keys of the other party.

------------------------------------------

## install
```
npm i -S @bicycle-codes/identity
```

## use
```js
import { Identity } from '@bicycle-codes/identity'

const id = await Identity.create({
    humanName: 'alice',
    humanReadableDeviceName: 'phone'
})
```

## quick example
Given two identities, create a message that is readble by them only.

```ts
import type { EncryptedMessage } from '@bicycle-codes/identity'
import { Identity } from '@bicycle-codes/identity'

// get identities somehow
const alice = await Identity.create(crypto, {
    humanName: 'alice',
})
const bob = await Identity.create(bobsCrypto, {
    humanName: 'bob'
})

const msgToBob = await alice.encryptMsg('hello bob', [
    await bob.serialize()
])

//  __the encrypted message__
//
// => {
//     payload:string, /* This is the message, encrypted with the AES key for
//         this message */
//     devices:Record<string, string> <-- A map from device name to AES key,
//          encrypted to the device
// }
//

// bob can read the message b/c they are passed in as a recipient above
const decrypted = await bob.decryptMsg(msgToBob)
   // => 'hello bob'
```

## API

See [bicycle-codes/identity](https://bicycle-codes.github.io/identity/) for complete API docs.

### import
Import functions and types

```ts
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
    verifyFromString,
    getDeviceName
} from '@bicycle-codes/identity'
```

### create
Use this factory function, not the constructor, because it is async.

By default this will use indexedDB with the keys `encryption-key` and `signing-key`. Pass in the options `encryptionKeyName` and `signingKeyName` to change these.

```ts
class Identity {
    static async create (opts:{
        humanName:string;
        type?: 'rsa';
        humanReadableDeviceName:string;  // a name for this device
        encryptionKeyName?:string;
        signingKeyName?:string;
    }):Promise<Identity>
}
```

#### example
```js
const alice = await Identity.create({
    humanName: 'alice',
    humanReadableDeviceName: 'phone'
})
```

### save
Save an existing Identity to `localStorage` and `indexedDB`.

By default this saves to the `localStorage` key `identity`. Set this class property to change the storage key.

```ts
class Identity {
    static STORAGE_KEY:string = 'identity'

    static save (id:SerializedIdentity) {
        localStorage.setItem(Identity.STORAGE_KEY, JSON.stringify(id))
    }
}
```

#### example
```js
import { Identity } from '@bicycle-codes/identity'

// `alice` is an id we created earlier
Identity.save(await alice.serialize())
```

### init
Load an Identity that has been saved in `localStorage` & `indexedDB`.

```ts
class Identity {
    static async init (opts:{
        type?:'rsa';
        encryptionKeyName:string;
        signingKeyName:string;
    } = {
        encryptionKeyName: DEFAULT_ENCRYPTION_KEY_NAME,
        signingKeyName: DEFAULT_SIGNING_KEY_NAME
    }):Promise<Identity>
}
```

#### example
```js
import { Identity } from '@bicycle-codes/identity'

const alice = await Identity.init()
```

### getDeviceName
Create a 32-character, DNS-friendly hash for a device. Takes either the DID
string or a CryptoKeyPair.

```ts
/**
 * @param {DID|CryptoKeyPair} input DID string or Crypto implementation
 * @returns {string} The 32-character hash string of the DID
 */
async function getDeviceName (input:DID|CryptoKeyPair):Promise<string>
```

#### example 

```js
import { getDeviceName } from '@bicycle-codes/identity'

const alicesDid = getDeviceName(alice.DID)
```

------------------------------------------

## types

### Device
```ts
export interface Device {
    name:string;  // <-- random, collision resistant name
    humanReadableName:string;
    did:DID;
    aes:string;  /* <-- the symmetric key for this account, encrypted to the
      exchange key for this device */
    encryptionKey:string;  // <-- encryption key, stringified
}
```

## z

This package exposes some type checking utilities made with [zod](https://zod.dev/). Import `z`:

```js
import { device, SerializedIdentity, did  } from '@bicycle-codes/identity/z'
```

--------------------------------------------------------------------------

## test
Tests run in a browser environment via [tape-run](https://github.com/tape-testing/tape-run).

```
npm test
```

------------------------------------------------------------------------

```js
const myDeviceName = getDeviceName(program.components.crypto)
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```

Pass in a DID as a string
```ts
import { getDeviceName } from '@bicycle-codes/identity'

const deviceName = getDeviceName('did:key:z13V3Sog2Y...')
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```
