import { test } from '@socketsupply/tapzero'
import * as odd from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'
import { Crypto } from '@oddjs/odd'
import {
    create, Identity,
    createDeviceName,
} from '../dist/index.js'

let identity:Identity
let rootDid:string
let alicesCrytpo:Crypto.Implementation
let rootDeviceName:string

test('create an identity', async t => {
    const program = await odd.program({
        namespace: { creator: 'test', name: 'testing' },
        debug: true
    })

    alicesCrytpo = program.components.crypto
    rootDid = await writeKeyToDid(alicesCrytpo)

    identity = await create(alicesCrytpo, {
        humanName: 'alice',
    })

    rootDeviceName = await createDeviceName(rootDid)
    t.ok(alicesCrytpo, "should create Alice's crypto")
    t.ok(rootDeviceName, 'should create root device name')
    t.ok(identity, 'should return a new identity')
    t.ok(identity.devices[rootDeviceName].aes,
        'should map the symmetric key, indexed by device name')
})
