import { render } from 'preact'
import { create } from '../dist/index.js'
import * as odd from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'

const program = await odd.program({
    namespace: { creator: 'test', name: 'testing' },
    debug: true
})

const alicesCrytpo = program.components.crypto
const rootDid = await writeKeyToDid(alicesCrytpo)
const identity = await create(program.components.crypto, {
    humanName: 'alice',
})

render((<div>
    <p>
        <strong>The rootDid:</strong>
        <pre>
            <code>{rootDid}</code>
        </pre>
    </p>

    <p>
        <strong>Devices:</strong>
        <pre>
            <code>{JSON.stringify(identity.devices, null, 2)}</code>
        </pre>
    </p>

    <strong>The identity:</strong>
    <pre>
        <code>{JSON.stringify(identity, null, 2)}</code>
    </pre>
</div>), document.getElementById('root')!)
