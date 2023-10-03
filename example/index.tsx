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
const identity = await create(alicesCrytpo, {
    humanName: 'alice',
})

render(<TheApp />, document.getElementById('root')!)

/**
 * We don't need a session from `odd`.
 *
 * We just need a way to get the new devices public exchange key to
 * the exisitng device.
 */

/**
 * Need some out of band communication
 * for example,
 *   - could have the new device go to a unique URL
 * Existing device needs to read the new device's public exchange key
 *
 * Existing device needs to know how to read the new key
 * discovery
 */

/**
 * __Fission account link process__
 * The new device displays a PIN
 * The existing device gets an event, 'challenge', and checks if the user input
 * matches the value in the 'challenge' event
 *
 *  ```
 *  producer.on('challenge', (challenge) => ...
 *  ```
 * The user should enter a PIN on the existing device, then we check if
 *   input matches the 'challenge' event value
 */

function TheApp () {
    return (<div>
        <strong>The rootDid:</strong>
        <pre>
            <code>{rootDid}</code>
        </pre>

        <strong>Devices:</strong>
        <pre>
            <code>{JSON.stringify(identity.devices, null, 2)}</code>
        </pre>

        <strong>The identity:</strong>
        <pre>
            <code>{JSON.stringify(identity, null, 2)}</code>
        </pre>
    </div>)
}

/**
 * Link a new device to the existing device
 */
function Link ({ session }:{ session?:odd.Session }) {
    if (!session) {
        // create a new session
        return (<div>
            not session
        </div>)
    }

    return <div>Link to an account</div>
}
