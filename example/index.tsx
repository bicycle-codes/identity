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
        The rootDid:
        <pre>
            <br />
            <code>{rootDid}</code>
        </pre>
    </p>

    <p>
        Devices:
        <pre>
            <code>{JSON.stringify(identity.devices, null, 2)}</code>
        </pre>
    </p>

    <p>
        The identity:
    </p>
    <pre>

        <code>{JSON.stringify(identity, null, 2)}</code>
    </pre>
</div>), document.getElementById('root')!)
