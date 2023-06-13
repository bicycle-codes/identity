__thinking about hand rolled shared files__
You would want to give one user write access, and many other users read access. 

Thinking about it from a capability point of view — user Alice creates a new key pair, and shares the 'public' key with users B, C, and D. To share the public key, you want to encrypt it "to" the other users.

Encrypting "to" someone means you need to know their exchange key, and encrypt to the exchange key.

Then you write a new message, encrypted with the group's private key, so that way anyone in the group can decrypt it. 

I had done similar things in `identity`. But that was about creating multiple devices per username, so I used symmetric keys.

```ts
import { aesGenKey, aesExportKey, rsa, importAesKey } from '@oddjs/odd/components/crypto/implementation/browser'

const exchangeKey = await crypto.keystore.publicExchangeKey()

const encryptedKey = toString(
  await rsa.encrypt(exported, exchangeKey),
  'base64pad'
)
```

-------------------------

## add a device

* [Account Linking](https://guide.fission.codes/accounts/account-signup/account-linking)
* [The Fission CLI account management commands](https://guide.fission.codes/developers/cli/managing-your-account#linking-an-existing-user)
* [See the existing code ](https://github.com/nichoth/real-hermes/blob/main/src/pages/link.tsx) for an example 

------------

After you link devices, the new device has a valid UCAN. Get it like this in the new device:

```js
JSON.parse(
    atob(Object.values(session.value.fs.proofs)[0].payload.prf.split('.')[1])
)
```

The signature:
```js
Object.values(session.value.fs.proofs)[0].payload.prf.split('.')[2]
```

This proves that the new device can speak for this account.

Notice that the `aud` field in the UCAN above is the DID for the new device, and the `iss` DID is for the device that was already registered with the account.

Or use [ucan verification](https://github.com/ucan-wg/ts-ucan#verifying-ucan-invocations)

```js
await ucans.verify(encoded
```
