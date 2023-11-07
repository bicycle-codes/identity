# identity ![tests](https://github.com/ssc-half-light/identity/actions/workflows/nodejs.yml/badge.svg)

This is an object representing a user. An Identity object contains a collection of "devices", where each device has several keypairs. This depends on each device having a [keystore](https://github.com/fission-codes/keystore-idb) that stores the private keys.

We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device. So the symmetric key is encrypted with the public key of each device.

Each device has a primary keypair used for signing, which is `did` here, and also an "exchange" keypair, which is used for encrypting & decrypting things. In the `Device` record there is also an index `aes`, which is the symmetrical key that has been encrypted to the device's exchange key.

see also, [keystore as used in crypto component](https://github.com/oddsdk/ts-odd/blob/main/src/components/crypto/implementation/browser.ts#L8) 

Devices are indexed by a sufficiently random key, created by calling [createDeviceName](https://github.com/ssc-half-light/identity/blob/ce5bb38cf9370c5f7ae1c5f545985c9ab574747b/src/index.ts#L359) with the primary did for the device.

------------------------

Sending a private messaesge to an identity would mean encrypting a message with a new symmetric key. That means encrypting `n` versions of the symmetric key, one for each device in the other identity.

So there you can think of it like one conversation = 1 symmetric key. The person initiating the conversation needs to know the exchange keys of the other party.

## storage
This is storage agnostic. You would want to save the identity object to a database or something, which is easy to do because keys are encrypted "at rest". Any device record pairs with a `keystore` instance on the device.

---------------------------

## install
```
npm i -S @ssc-half-light/identity
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

--------------------------------------------------------------------------

## example
Start the example. This will start local servers and open a browser.
```
npm start
```

## env variables
If you deploy this to the internet, you will need to deploy the env variables to partykit as well:

```sh
npx partykit deploy --with-vars
```

### party
The example opens a websocket connection to our [partykit server](https://www.partykit.io/) in response to DOM events. We generate a random 6 digit number, and use that to connect multiple devices to the same websocket server. The root device (the one that generated the PIN) will get a message from the new device, containing the exchange public key and DID. The root device then encrypts the AES key to the exchange key in the message, and then sends the encrypted AES key back to the new device over the websocket.

After that both machines have the same AES key, so are able to read & write the same data.

-------------------------------------------------------------------------

## test
Tests run in node because we are using `@ssc-hermes/node-components`.

```
npm test
```

------------------------------------------------------------------------

## API

```js
import {
    create,
    decryptKey,
    Identity,
    ALGORITHM,
    add,
    createDeviceName,
    encryptTo,
    CurriedEncrypt
} from '@ssc-half-light/identity'
```

```ts
import { test } from '@nichoth/tapzero'
import { writeKeyToDid } from '@ssc-half-light/util'
import { components, createCryptoComponent } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import { aesEncrypt, aesDecrypt } from
    '@oddjs/odd/components/crypto/implementation/browser'
import { fromString, toString } from 'uint8arrays'
import {
    create, decryptKey, Identity, ALGORITHM, add,
    createDeviceName, encryptTo, CurriedEncrypt
} from '@ssc-half-light/identity'
```

### create
Create an identity

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
import { aesDecrypt, aesEncrypt } from '@ssc-half-light/identity'

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
```ts
/**
 * Encrypt a given message to the given set of identities.
 * To decrypt this message, use your exchange key to decrypt the symm key,
 * then use the symm key to decrypt the payload.
 *
 * This creates a new AES key each time it is called.
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

### decryptMsg
Decrypt a message. Takes an encrypted message, and returns the decrypted message body.

```js
async function decryptMsg (
    crypto:Crypto.Implementation,
    encryptedMsg:EncryptedMessage
):Promise<string>
```

#### example
```js
const newMsg = await encryptTo(alice, [bob], 'hello bob') as EncryptedMessage
t.ok(newMsg.payload, 'Encrypted message should have payload')

const newDecryptedMsg = await decryptMsg(bobsCrypto, newMsg)

t.equal(newDecryptedMsg, 'hello bob',
    'Bob can decrypt a message encrypted to bob')
```

### group
Create a group of identities that share a single AES key. This differs from `encryptTo`, above, because this takes an existing key, instead of creating a new one.

```ts
/**
 * Create a group with the given AES key. This is different than `encryptTo`
 * because this takes an existing key, instead of creating a new one.
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
):Promise<Group> {
```

### group.decrypt
Decrypt a message that has been encrypted to your identity.

```ts
async function decrypt (
    crypto:Crypto.Implementation,
    group:Group,
    msg:string|Uint8Array
):Promise<string>
```

```js
const myGroup = await group(alice, [bob, carol], key)
const groupMsg = await myGroup('hello group')
const msg = await myGroup.decrypt(alicesCrytpo, myGroup, groupMsg)
// => 'hello group'
```

### createDeviceName
Create a URL-friendly string from a DID.

```ts
async function createDeviceName (did:DID):Promise<string>
```

```js
import { createDeviceName } from '@ssc-half-light/identity'
// ...create an odd program here...
const myDid = await program.agentDID()
const myDeviceName = createDeviceName(myDid)
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```

### getDeviceName
Pass in a `crypto` instance

```ts
async function getDeviceName (input:DID|Crypto.Implementation):Promise<string>
```

```ts
import { getDeviceName } from '@ssc-half-light/identity'
const myDeviceName = getDeviceName(program.components.crypto)
// => '4k4z2xpgpmmssbcasqanlaxoxtpppl54'
```