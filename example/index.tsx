import { render } from 'preact'
import * as odd from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'
import PartySocket from 'partysocket'
import { create } from '../src/index.js'

const program = await odd.program({
    namespace: { creator: 'test', name: 'testing' },
    debug: true
})

const alicesCrytpo = program.components.crypto
const rootDid = await writeKeyToDid(alicesCrytpo)
const identity = await create(alicesCrytpo, {
    humanName: 'alice',
})

// ------------------------------------------------------

// connect to our server
const partySocket = new PartySocket({
    host: 'localhost:1999',
    room: 'my-room',
})

// send a message to the server
partySocket.send('Hello everyone')

// print each incoming message from the server to console
partySocket.addEventListener('message', (ev) => {
    console.log(ev.data)
})

// ------------------------------------------------------

render(<TheApp />, document.getElementById('root')!)

/**
 * We don't need a session from `odd`, just the `crypto` object.
 *
 * We need a way to get the new devices public exchange key to
 * the exisitng device.
 */

/**
 * New device needs to know the 'username' of existing account
 * Existing device needs to confirm the PIN
 */

/**
 * Existing device needs to read the new device's public exchange key
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

// /**
//  * Link a new device to the existing device
//  */
// function Link ({ session }:{ session?:odd.Session }) {
//     if (!session) {
//         // create a new session
//         return (<div>
//             not session
//         </div>)
//     }

//     return <div>Link to an account</div>
// }
