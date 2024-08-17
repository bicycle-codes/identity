# docs

## WIP

* [odd program](https://github.com/oddsdk/ts-odd/blob/f90bde37416d9986d1c0afed406182a95ce7c1d7/src/index.ts#L224)

In ODD, [keystore.init](https://github.com/oddsdk/ts-odd/blob/f90bde37416d9986d1c0afed406182a95ce7c1d7/src/components/crypto/implementation/browser.ts#L310)

[keystore -- create if does not exist](https://github.com/fission-codes/keystore-idb/blob/0bbb92aeba7a33a5372bd2ef64dce1c3ee1f7213/src/rsa/keystore.ts#L20)

  |
  v

[keystore `makeKeyPair`](https://github.com/fission-codes/keystore-idb/blob/0bbb92aeba7a33a5372bd2ef64dce1c3ee1f7213/src/rsa/keys.ts#L7)


-----------------------------


## indexedDB

### [`.persist` method](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)


## partykit deploy environments

### 10/24/2023 11:24 AM
> what is the recommended setup for dev / staging / prod deployments for partykit server deploy (using npx partykit deploy)? do i need to somehow make a separate app for each?

###  10/24/2023 12:03 PM
> you can deploy with a `--preview` flag, e.g.

```sh
npx partykit deploy --preview staging
```

This would deploy to `staging.project.username.partykit.dev`.

You can also create ephemeral preview environments for e.g. each branch or pull request in your CI environment, but it takes 1-2 minutes to provision new subdomains, so there will be a short delay before the branch environment is available


## things to know

* Exchange key = encrypt & decrypt
* Write key = sign things
