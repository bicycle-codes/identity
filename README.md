# identity 
![tests](https://github.com/bicycle-codes/identity/actions/workflows/nodejs.yml/badge.svg)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@bicycle-codes/identity)](https://socket.dev/npm/package/@bicycle-codes/identity)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![types](https://img.shields.io/npm/types/@bicycle-codes/identity?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://nichoth.github.io/badge/license-polyform-shield.svg)](LICENSE)

This is an object representing a user. An Identity object contains a collection of "devices", where each device has several keypairs. This depends on each device having a [keystore](https://github.com/fission-codes/keystore-idb) that stores the private keys.

We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device. So the symmetric key is encrypted with the public key of each device.

Each device has a primary keypair used for signing, which is `did` here, and also an "exchange" keypair, which is used for encrypting & decrypting things. In the `Device` record there is also an index `aes`, which is the symmetrical key that has been encrypted to the device's exchange key.

see also, [keystore as used in crypto component](https://github.com/oddsdk/ts-odd/blob/main/src/components/crypto/implementation/browser.ts#L8) 

Devices are indexed by a sufficiently random key, created by calling [createDeviceName](https://github.com/bicycle-codes/identity/blob/ce5bb38cf9370c5f7ae1c5f545985c9ab574747b/src/index.ts#L359) with the primary did for the device.

------------------------

## E2E encryption
Sending a private message to an identity would mean encrypting a message with a new symmetric key, then encrypting `n` versions of the symmetric key, one for each device in the other identity.

You can think of it like one conversation = 1 symmetric key. The person initiating the conversation needs to know the exchange keys of the other party.

------------------------------------------

## install
```
npm i -S @bicycle-codes/identity
```

## use
This uses [@oddjs/odd](https://www.npmjs.com/package/@oddjs/odd) to store the local keys.

```js
import { program as createProgram } from '@oddjs/odd'
import { create } from '@bicycle-codes/identity'

// ...get an ODD program somehow...

const program = await createProgram({
    namespace: {
        name: 'my-app',
        creator: 'my-company'
    }
})
crypto = program.components.crypto

// ...

identity = await create(crypto, {
    humanName: 'alice',
})
```

------------------------------------------

## demo

See [a live demo](https://nichoth-identity.netlify.app/) of the [example directory](./example/)

This uses websockets to 'link' two devices. That is, a single AES key is encrypted to the exchange key on each device, so both devices are able to use the same key.

------------------------------------------

## types

### Identity
```ts
interface Identity {
    humanName:string,  /* a human readble name for the identity */
    username:string,  /* the random string for the root device.
      Not human-readable */
    rootDid:DID  /* `did:key:z${string}`
      The DID of the first device to use this identity */
    devices:Record<string, Device>  /* a map of devices in this identity */
}
```

### Device
```ts
interface Device {
    name:string,  // the random string for this device
    did:DID,  // `did:key:z${string}`
    aes:string,  /* the symmetric key for this account, encrypted to the
      exchange key for this device */
    exchange:string  // public key used for encrypting & decrypting
}
```

## group
A function from data to an encrypted string.

```ts
type Group = {
    groupMembers: Identity[];
    encryptedKeys: Record<string, string>;
    decrypt: (
        crypto:Implementation,
        group:Group,
        msg:string|Uint8Array
    ) => Promise<string>;
    (data:string|Uint8Array): Promise<string>
}
```

--------------------------------------------------------------------------


## example
Start the [example](./example/). This will start local servers and open a browser.
```
npm start
```

### party
The example opens a websocket connection to our [partykit server](https://www.partykit.io/) in response to DOM events. We generate a random 6 digit number, and use that to connect multiple devices to the same websocket server. The root device (the one that generated the PIN) will get a message from the new device, containing the exchange public key and DID. The root device then encrypts the AES key to the exchange key in the message, and then sends the encrypted AES key back to the new device over the websocket.

After that both machines have the same AES key, so are able to read & write the same data.

## storage
This is storage agnostic. You would want to save the identity object to a database or something, which is easy to do because keys are encrypted "at rest". Any device record pairs with a [keystore](https://github.com/fission-codes/keystore-idb) instance on the device.

## env variables
We are not using any env variables. If you use an env variable, deploy to partykit like this:

```sh
npx partykit deploy --with-vars
```

There is an env variable, `PARTYKIT_TOKEN`, on github. This is for deploying partykit automatically on any github push. It's not used by our app.

-------------------------------------------------------------------------

## test
Tests run in node because we are using [@ssc-hermes/node-components](https://github.com/ssc-half-light/node-components).

```
npm test
```

------------------------------------------------------------------------

## API
Import functions and types

```ts
import { test } from '@bicycle-codes/tapzero'
import {
    components,
    createCryptoComponent
} from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import {
    fromString, toString, toString, fromString,
    writeKeyToDid, aesEncrypt, aesDecrypt,
    create, decryptKey, Identity, ALGORITHM, add,
    createDeviceName, encryptTo, CurriedEncrypt,
    decryptMsg, DID, sign, signAsString, verifyFromString
} from '@bicycle-codes/identity'
```

### strings
Convenient helpers that will encode and decode strings with `base64pad` format.

```js
import { fromString, toString } from '@bicycle-codes/identity'
```

### create
Create an identity

```ts
import { program as createProgram } from '@oddjs/odd'
import {
    create,
    writeKeyToDid,
    getDeviceName
} from '@bicycle-codes/identity'

let identity:Identity
let rootDid:DID
let crypto:Crypto.Implementation
let rootDeviceName:string

test('create an identity', async t => {

    // ...get an ODD program somehow...
    const program = await createProgram({
        namespace: {
            name: 'my-app',
            creator: 'my-company'
        },
        debug: true,
        fileSystem: {
            loadImmediately: false
        }
    })
    crypto = program.components.crypto
    // ...

    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = await getDeviceName(rootDid)
    rootDeviceName = deviceName
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should index the symmetric key by device name')
})
```

### sign and verify
Sign a given string, and verify the signature.

```ts
// ... get an odd crypto instance ...
// eg, const { crypto } = program.components
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
```

### decryptKey
Decrypt the given encrypted AES key.

```ts
async function decryptKey (
    crypto:Crypto.Implementation,
    encryptedKey:string
):Promise<CryptoKey>
```

```js
const aes = identity.devices[rootDeviceName].aes
const decryptedKey = await decryptKey(crypto, aes)
```

Use the decrypted key to read and write

```ts
import { aesDecrypt, aesEncrypt } from '@bicycle-codes/identity'

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

### encryptKey
Encrypt a given AES key to a given exchange key. You mostly should not need to use this.
```ts
/**
 * Encrypt a given AES key to the given exchange key
 * @param key The symmetric key
 * @param exchangeKey The exchange key to encrypt *to*
 * @returns the encrypted key, encoded as 'base64pad'
 */
export async function encryptKey (
    key:CryptoKey,
    exchangeKey:Uint8Array|CryptoKey
):Promise<string>
```

### add
Add a device to this identity.

We need to pass in the `crypto` object from the original identity, because we need to decrypt the secret key, then re-encrypt it to the new device:

```js
// decrypt the AES key
const secretKey = await decryptKey(
    crypto,
    id.devices[existingDeviceName].aes
)
```

We need to call this function from the existing device, because we need to decrypt the AES key. We then re-encrypt the AES key to the public exchange key of the new device. That means we need to get the `exchangeKey` of the new device somehow.

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

### encryptTo
Encrypt a message to the given set of identities. To decrypt this message, use your exchange key to decrypt the AES key, then use the AES key to decrypt the payload.

```ts
/**
 * This creates a new AES key each time it is called.
 * 
 * @param crypto odd crypto object
 * @param ids The Identities we are encrypting to
 * @param data The message we want to encrypt
 */
export async function encryptTo (
    creator:Identity,
    ids:Identity[],
    data?:string|Uint8Array
):Promise<EncryptedMessage | CurriedEncrypt>
```

#### `encryptTo` example
```ts
// a message from alice to bob
const encryptedMsg = await encryptTo(alice, [bob], 'hello bob')

const alice = await create(alicesCrypto, {
    humanName: 'alice'
})
const bob = await create(bobsCrypto, {
    humanName: 'bob'
})
```

#### curried `encryptTo`
`encryptTo` can be partially applied by calling without the last argument, the message.

```ts
const encryptedGroup = await encryptTo(alice, [
    bob,
    carol
]) as CurriedEncrypt
```

### decryptMsg
Decrypt a message. Takes an encrypted message, and returns the decrypted message body.

```js
async function decryptMsg (
    crypto:Crypto.Implementation,
    encryptedMsg:EncryptedMessage
):Promise<string>
```

#### `decryptMsg` example
```js
const newMsg = await encryptTo(alice, [bob], 'hello bob') as EncryptedMessage
t.ok(newMsg.payload, 'Encrypted message should have payload')

const newDecryptedMsg = await decryptMsg(bobsCrypto, newMsg)

t.equal(newDecryptedMsg, 'hello bob',
    'Bob can decrypt a message encrypted to bob')
```

### group
Create a group of identities that share a single AES key.

This will return a new function that encrypts data with the given key.

This differs from `encryptTo`, above, because this takes an existing key, instead of creating a new one.

```ts
export type Group = {
    groupMembers: Identity[];
    encryptedKeys: Record<string, string>;
    decrypt: (
        crypto:Crypto.Implementation,
        group:Group,
        msg:string|Uint8Array
    ) => Promise<string>;
    (data:string|Uint8Array): Promise<string>
}
```

```ts
/**
 * Create a group with the given AES key.
 *
 * @param creator The identity that is creating this group
 * @param ids An array of group members
 * @param key The AES key for this group
 * @returns {Promise<Group>} Return a function that takes a string of
 * data and returns a string of encrypted data. Has keys `encryptedKeys` and
 * `groupMemebers`. `encryptedKeys` is a map of `deviceName` to the
 * encrypted AES key for this group. `groupMembers` is an array of all
 * the Identities in this group.
 */
export async function group (
    creator:Identity,
    ids:Identity[],
    key:CryptoKey
):Promise<Group>
```

#### `group` example
```js
import { group } from '@bicycle-codes/identity'

// bob and carol are instances of Identity
const myGroup = await group(alice, [bob, carol], key)
```

### group.Decrypt
Decrypt a message that has been encrypted to the group.

```ts
async function Decrypt (
    group:Group,
    crypto:Crypto.Implementation,
    msg:string|Uint8Array
):Promise<string>
```

#### `group.Decrypt` example
```js
import { group } from '@bicycle-codes/identity'

const myGroup = await group(alice, [bob, carol], key)
const groupMsg = await myGroup('hello group')
const msg = await group.Decrypt(alicesCrytpo, myGroup, groupMsg)
// => 'hello group'
```

### AddToGroup
Add another identity to a group, and return a new group (not the same instance).

If you pass in a `Crypto.Implementation` instance, then we will use that to decrypt the key of the given group.

If you pass in an AES `CryptoKey`, it will be encrypted to the new user. It should be the same AES key that is used by the group.

```ts
async function AddToGroup (
    group:Group,
    keyOrCrypto:CryptoKey|Implementation,
    newGroupMember:Identity,
):Promise<Group>
```

#### `AddToGroup` example
```js
import { AddToGroup, create } from '@bicycle-codes/identity'

const fran = await create(_crypto, {
    humanName: 'fran'
})

const newGroup = await AddToGroup(myGroup, alicesCrytpo, fran)
```

### getDeviceName
Create a URL-friendly hash string for a device. This is 32 characters of a hash
for a given device's DID. It will always return the same string for the
same DID/device.

Pass in a `crypto` instance or DID string
```ts
async function getDeviceName (input:DID|Crypto.Implementation):Promise<string>
```

#### `getDeviceName` example

Pass in a `crypto` instance
```ts
import { getDeviceName } from '@bicycle-codes/identity'

const myDeviceName = getDeviceName(program.components.crypto)
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```

Pass in a DID as a string
```ts
import { getDeviceName } from '@bicycle-codes/identity'

const deviceName = getDeviceName('did:key:z13V3Sog2Y...')
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```
