# identity ![tests](https://github.com/ssc-hermes/identity/actions/workflows/nodejs.yml/badge.svg)

An identity record + types

Track a single identity across multiple devices.

* all devices need to have read & write access to the same documents
* we want e2e encryption

Each device has a keypair that never leaves the device, and the private key is not readble at all (it is not-exportable). We can do e2e encryption by creating a symmetric key, then encrypting that key *to* each device. So the symmetric key is encrypted with the public key of each device.

A given device would then decrypt the symmetric key, and use it to read any document that belongs to the user.

The record of encrypted symmetric keys can then be saved somewhere and served freely, because it is only usable with the private key of a given device.

## install
```
npm i -S @ssc-hermes/identity
```

## test
```
npm test
```
