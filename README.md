# identity 
![tests](https://github.com/bicycle-codes/identity/actions/workflows/nodejs.yml/badge.svg)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![types](https://img.shields.io/npm/types/@bicycle-codes/identity?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://nichoth.github.io/badge/license-polyform-shield.svg)](LICENSE)

Use [non-extractable keypairs](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#extractable) as user identity.

-----------

Use the [webcrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to create keypairs representing a user.

All encryption is via [AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#algorithm).

All asymmetric crypto is using RSA, because we are waiting for more browsers to support ECC.

----------------------------------------------------------
## contents
----------------------------------------------------------

<!-- toc -->

- [conceptual view](#conceptual-view)
- [E2E encryption](#e2e-encryption)
- [install](#install)
- [use](#use)
- [quick example](#quick-example)
- [API](#api)
  * [globals](#globals)
  * [import](#import)
  * [create](#create)
  * [save](#save)
  * [init](#init)
  * [serialize](#serialize)
  * [getDeviceName](#getdevicename)
  * [sign](#sign)
  * [signAsString](#signasstring)
  * [`static createDeviceRecord`](#static-createdevicerecord)
  * [encryptMsg](#encryptmsg)
  * [decryptMsg](#decryptmsg)
  * [addDevice](#adddevice)
- [types](#types)
  * [Device](#device)
  * [SerializedIdentity](#serializedidentity)
  * [Msg](#msg)
  * [EncryptedMessage](#encryptedmessage)
- [z](#z)
- [test](#test)

<!-- tocstop -->

## conceptual view

Create two keypairs -- 1 for signing and 1 for encrypting, and store them in `indexedDB` in the browser. [All keypairs here are "non-extractable"](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#extractable), so you are never able to read the private key, but they still persist indefinitely in indexedDB.

We can do passwordless user ID, using something like [UCAN](https://github.com/ucan-wg/ts-ucan) to link multiple devices if you want.


## E2E encryption

We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device that should be able to read the message. So the symmetric key is encrypted with the public key of each device.

Devices are indexed by a sufficiently random key, created by calling [getDeviceName](#getdevicename) with the primary did for the device.

------------------------

Sending a private message to an identity would mean encrypting a message with a new symmetric key, then encrypting `n` versions of the symmetric key, one for each device in the other identity.

You can think of it like one conversation = 1 symmetric key. The person initiating the conversation needs to know the encryption keys of the other party.


------------------------------------------
## install
------------------------------------------

```sh
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

------------------------------------------
## quick example
------------------------------------------
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

----------------------------------------------------------
## API
----------------------------------------------------------

See [bicycle-codes.github.io/identity](https://bicycle-codes.github.io/identity/) for complete API docs.

### globals
We use some "global" keys in `indexedDB` and `localStorage`. These can be configured by setting class properties.

#### `indexedDB`

* `encryption-key` -- RSA key for encrypt/decrypt
* `signing-key` -- RSA key for signatures

Set the class properties `ENCRYPTION_KEY_NAME` and `SIGNING_KEY_NAME` to configure this.

```ts
class Identity {
    static ENCRYPTION_KEY_NAME:string = 'encryption-key'
    static SIGNING_KEY_NAME:string = 'signing-key'
}
```

#### `localStorage`

* `identity` -- store a serialized Identity here, when you call [save](#save).

Configure this with the class property `STORAGE_KEY`.

```ts
class Identity {
    static STORAGE_KEY:string = 'identity'
}
```

----------------------------------------------------------
### import
----------------------------------------------------------

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

By default this will store keypairs in `indexedDB` with the keys `encryption-key` and `signing-key`. Set the class properties `ENCRYPTION_KEY_NAME` and `SIGNING_KEY_NAME` to change these.

```ts
class Identity {
    static async create (opts:{
        humanName:string;
        type?: 'rsa';
        humanReadableDeviceName:string;  // a name for this device
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
Save an existing Identity to `localStorage`.

By default this saves to the `localStorage` key `identity`. Set the class property `STORAGE_KEY` to change the storage key.

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

### serialize

Return a JSON stringifiable version of this Identity.

```ts
class Identity {
    async serialize ():Promise<SerializedIdentity>
}
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

### sign
Sign the given message with the RSA `signingKey`; return a `Uint8Array`.

```ts
class Identity {
    sign (msg:Msg, charsize?:CharSize):Promise<Uint8Array>
}
```

### signAsString
Sign the given message with the RSA `signingKey`; return a `string`.

```ts
class Identity {
    signAsString (msg:string):Promise<string>
}
```

### `static createDeviceRecord`

Create a new [Device record](#device). This means creating asymmetric keypairs for the device, and storing them in `indexedDB`. This does not include an AES key in the device record, because typically you create a device record before adding the device to a different Identity, so you would add an AES key at that point.

This function does read the class properties `ENCRYPTION_KEY_NAME` and `SIGNING_KEY_NAME`, because it creates asymmetric keys for the device and saves them in `localStorage`.

```ts
class Identity {
    static async createDeviceRecord (opts:{
        humanReadableName:string
    }):Promise<Omit<Device, 'aes'>> {
}
```

### encryptMsg
Each new message gets a new AES key. The key is then encrypted to the public
key of each recipient.

```ts
class Identity {
    async encryptMsg (
        data:string|Uint8Array,
        recipients?:SerializedIdentity[],
    ):Promise<EncryptedMessage>
}
```

### decryptMsg
The given message should include an AES key, encrypted to this device. Look up the AES key by device name, and use it to decrypt the message.

```ts
class Identity {
    async decryptMsg (encryptedMsg:EncryptedMessage):Promise<string>
}
```

### addDevice
Add a new device to this Identity. Returns `this`.

```ts
class Identity {
    async addDevice (opts:Omit<Device, 'aes'>):Promise<Identity>
}
```

#### example
```js
import { Identity } from '@bicycle-codes/identity'

const alice = Identity.create({ /* ... */ })

// ... need to get the other device record somehow ...
const workComputer:Device = // ...

await alice.addDevice(workComputer)
```

----------------------------------------------------------
## types
----------------------------------------------------------

### Device

```ts
interface Device {
    name:string;  // <-- random, collision resistant name
    humanReadableName:string;
    did:DID;
    aes:string;  /* <-- the symmetric key for this account, encrypted to the
      exchange key for this device */
    encryptionKey:string;  // <-- encryption key, stringified
}
```

### SerializedIdentity

```ts
interface SerializedIdentity {
    humanName:string;
    username:string;
    DID:DID;
    rootDID:DID;
    rootDeviceName:string;
    devices:Record<string, Device>;
    storage:{ encryptionKeyName:string; signingKeyName:string; }
}
```

### Msg
```ts
type Msg = ArrayBuffer|string|Uint8Array
```

### EncryptedMessage
Each new message gets a new AES key. The key is then encrypted to the public
key of each recipient.

```ts
interface EncryptedMessage<T extends string = string> {
    payload:T, /* This is the message, encrypted with the symm key for
        the message */
    devices:Record<string, string>  /* a map from `deviceName` to this
        messages's encrypted AES key, encrypted to that device */
}
```

------------------------------------------
## z
------------------------------------------

This package exposes some type checking utilities made with [zod](https://zod.dev/). Import `z`:

```js
import { device, SerializedIdentity, did  } from '@bicycle-codes/identity/z'
```

--------------------------------------------------------------------------
## test
--------------------------------------------------------------------------
Tests run in a browser environment via [tape-run](https://github.com/tape-testing/tape-run).

```
npm test
```
