import { test } from 'tapzero'
import { build, EdKeypair } from '@ucans/ucans'
import { create } from '../dist/index.js'
import { writeKeyToDid } from '@ssc-hermes/util'
import { components } from '@ssc-hermes/node-components'

test('create an identity', async t => {
    const keypair = await EdKeypair.create()
    const { crypto } = components
    const rootDid = await writeKeyToDid(crypto)

    const identity = await create(crypto, {
        username: 'alice123',
        ucan: await build({
            audience: rootDid,
            issuer: keypair
        })
    })

    t.ok(identity, 'should return a new identity')
    console.log('**identity**', identity)
    t.ok(identity.key[rootDid], 'should map the DIDs to an encrypted key')
})
