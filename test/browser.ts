import { test } from '@socketsupply/tapzero'
import { writeKeyToDid } from '@ssc-hermes/util'
import { components } from '@ssc-hermes/node-components'
import { Crypto } from '@oddjs/odd'
import {
    create, Identity,
    createDeviceName,
} from '../dist/index.js'

let identity:Identity
let rootDid:string
let crypto:Crypto.Implementation
let alicesCrytpo:Crypto.Implementation
let rootDeviceName:string
let alicesDeviceName:string

test('create an identity', async t => {
    crypto = alicesCrytpo = components.crypto
    rootDid = await writeKeyToDid(crypto)

    identity = await create(crypto, {
        humanName: 'alice',
    })

    const deviceName = alicesDeviceName = await createDeviceName(rootDid)
    rootDeviceName = deviceName
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[deviceName].aes,
        'should map the symmetric key, indexed by device name')
})
