# identity ![tests](https://github.com/ssc-hermes/identity/actions/workflows/nodejs.yml/badge.svg)

An identity record + types

Track a single identity across multiple devices.

* all devices need to have read & write access to the same documents
* we want e2e encryption

So a collection of devices forms a single *identity*.

Each device has a keypair that never leaves the device, and the private key is not readble at all (it is not-exportable). We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device. So the symmetric key is encrypted with the public key of each device.

A device would read the relevant identity document from a DB, and decrypt the symmetric key with its local keypair. Then we use the symmetric key to decrypt or encrypt any document you need to read.

This way we can save the identity document to a DB, while still keeping things e2e encrypted.

-------

This module is agnostic about storage. You would want to save the identity object to a database or something, which is easy to do because it is encrypted "at rest".

## install
```
npm i -S @ssc-hermes/identity
```

## test
```
npm test
```

## example

```js
import { test } from 'tapzero'
import { build } from '@ucans/ucans'
import { writeKeyToDid } from '@ssc-hermes/util'
import { create } from '@ssc-hermes/identity'

Create an identity object

test('create an identity object', async t => {
    const keypair = await EdKeypair.create()
    crypto = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        username: 'alice123',
        ucan: await build({
            audience: rootDid,
            issuer: keypair
        })
    })
    // => interface Identity {
    //     username:string,
    //     key:Record<string, string>,
    //     ucan:Ucan,
    //     rootDid:string
    // }

    // `key` is a map from device DID to encrypted key

    t.ok(identity, 'should return a new identity')
    t.ok(identity.key[rootDid],
        'should map the symmetric key, indexed by device DID')
    t.ok(identity.ucan, 'should incldue the UCAN')
})
```

Use the symmetric key to encrypt and decrypt something

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
