import { render } from 'preact'
import * as odd from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-hermes/util'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import PartySocket from 'partysocket'
import { customAlphabet } from '@nichoth/nanoid'
import { numbers } from '@nichoth/nanoid-dictionary'
// @ts-ignore  Don't know why it can't find this
import { Button } from '@nichoth/components/button'
import { Identity, create } from '../src/index.js'
import '@nichoth/components/button.css'
import '@nichoth/components/text-input.css'
import './index.css'

const program = await odd.program({
    namespace: { creator: 'test', name: 'testing' },
    debug: true
})

const alicesCrytpo = program.components.crypto
const rootDid = await writeKeyToDid(alicesCrytpo)

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
    const code = useSignal<string>('')
    const id = useSignal<Identity|null>(null)
    const status = useSignal<'add'|'join'|null>(null)
    const isValidPin = useSignal<boolean>(false)

    // @ts-ignore
    window.id = id

    console.log('rendering', code.value)

    // * create an identity
    useEffect(() => {
        (async () => {
            const identity = await create(alicesCrytpo, {
                humanName: 'alice',
            })

            id.value = identity
        })()
    }, [])

    // Connect to partykit
    // listen for a message containing the new DID
    function addDevice (ev) {
        ev.preventDefault()
        status.value = 'add'

        const PIN = customAlphabet(numbers, 6)
        code.value = ('' + PIN())

        console.log('add a device...')

        // connect to our server
        const partySocket = new PartySocket({
            host: 'localhost:1999',
            room: code.value,
            id: rootDid,
            query: {
                token: 'aaaaa',
            },
        })

        partySocket.addEventListener('message', (ev) => {
            // we should only get one message containing the new DID
            // of the new device

            console.log('from the server:', ev.data)

            // add the device here...

            partySocket.close()
        })
    }

    /**
     * Merge this with an existing Identity
     */
    async function join (ev:SubmitEvent) {
        ev.preventDefault()
        console.log('merge this device into another ID')
        const el = (ev.target as HTMLFormElement).elements['pin']
        const pin = el.value

        // now try to connect via partykit
        const partySocket = new PartySocket({
            host: 'localhost:1999',
            room: pin,
            query: {
                token: 'aaaaa'
            }
        })

        partySocket.send(JSON.stringify({
            newDid: await writeKeyToDid(alicesCrytpo)
        }))

        partySocket.close()
    }

    function pinInput (ev:InputEvent) {
        const el = ev.target as HTMLInputElement
        el.value = '' + el.value.slice(0, parseInt(el.getAttribute('maxlength')!))
        const max = parseInt(el.getAttribute('maxlength')!)
        const min = parseInt(el.getAttribute('minlength')!)
        const valid = (el.value.length >= min && el.value.length <= max)
        if (valid !== isValidPin.value) isValidPin.value = valid
    }

    function addToExisting (ev:SubmitEvent) {
        ev.preventDefault()
        status.value = 'join'
    }

    return (<div className="content">
        {code.value ?
            (<div className="the-pin">
                <div><strong>the PIN</strong></div>
                <code>
                    {code.value}
                </code>
                <p>Enter this PIN in the new device.</p>
            </div>) :
            (status.value === 'join' ?
                <form className="pin-form" onSubmit={join}>
                    <p>Enter the PIN here from the parent device</p>

                    <div>
                        <input name="pin" className="pin" type="number"
                            minLength={6}
                            maxLength={6}
                            autoComplete="off"
                            inputMode="numeric"
                            id="pin-input"
                            onInput={pinInput}
                        />
                    </div>

                    <div>
                        <Button type="submit"
                            className="try-link"
                            disabled={!isValidPin}
                        >
                            Link Devices
                        </Button>
                    </div>
                </form> :
                null)
        }

        {!status.value ?
            (<div className="add-or-join">
                <form onSubmit={addDevice}>
                    <Button type="submit">Add a device</Button>
                </form>

                <hr />

                <form onSubmit={addToExisting}>
                    <Button type="submit">Add this device to another identity</Button>
                </form>
            </div>) :
            null
        }

        <hr />

        <div className="identity">
            <strong>The root DID:</strong>
            <pre>
                <code>{rootDid}</code>
            </pre>

            <strong>The identity:</strong>
            <pre>
                <code>{JSON.stringify(id.value, null, 2)}</code>
            </pre>
        </div>

    </div>)
}
