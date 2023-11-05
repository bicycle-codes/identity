import { render } from 'preact'
import * as odd from '@oddjs/odd'
import { writeKeyToDid } from '@ssc-half-light/util'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import PartySocket from 'partysocket'
import { customAlphabet } from '@nichoth/nanoid'
import { numbers } from '@nichoth/nanoid-dictionary'
// @ts-ignore -- why can't it find this?
import { Button } from '@nichoth/components/htm/button'
import {
    Identity,
    add as addDeviceToIdentity,
    create,
    arrayBuffer
} from '../src/index.js'
import * as z from '../src/z.js'
import '@nichoth/components/button.css'
import '@nichoth/components/text-input.css'
import './index.css'

const program = await odd.program({
    namespace: { creator: 'test', name: 'testing' },
    debug: true
})

const crypto = program.components.crypto
const myDid = await writeKeyToDid(crypto)

if (!import.meta.env.VITE_PARTY_TOKEN) throw new Error('Missing token')

render(<TheApp />, document.getElementById('root')!)

/**
 * We don't need a session from `odd`, just the `crypto` object.
 */

type Message = {
    newDid:`did:key:z${string}`,
    exchangeKey:string
}

function TheApp () {
    const code = useSignal<string>('')
    const id = useSignal<Identity|null>(null)
    const status = useSignal<'add'|'join'|'success'|null>(null)
    const isValidPin = useSignal<boolean>(false)

    // @ts-ignore
    window.id = id
    // @ts-ignore
    window.program = program

    /**
     * create an identity
     */
    useEffect(() => {
        (async () => {
            const identity = await create(crypto, {
                humanName: 'alice',
            })

            id.value = identity
        })()
    }, [])

    /**
     * Listen for a message from partykit containing the new device's DID
     * @param {SubmitEvent} ev
     */
    function addDevice (ev) {
        ev.preventDefault()
        status.value = 'add'

        /**
         * @TODO
         * Use full (lowercase) alphabet, for less chance of collision?
         */
        const PIN = customAlphabet(numbers, 6)
        code.value = ('' + PIN())

        const serverAddress = (import.meta.env.DEV ?
            'localhost:1999' :
            'identity-party.nichoth.partykit.dev')

        /**
         * connect to our server
         */
        const partySocket = new PartySocket({
            host: serverAddress,
            room: code.value,
            id: myDid,
            query: {
                token: import.meta.env.VITE_PARTY_TOKEN,
            },
        })

        partySocket.addEventListener('message', async (ev) => {
            // we should only get one message containing the DID
            //   and exchangeKey of the new device

            console.log('from the server:', ev.data)

            let msg:Message
            try {
                msg = JSON.parse(ev.data)
            } catch (err) {
                console.log('bad json', err)
                throw err
            }

            const { newDid, exchangeKey } = msg
            if (!newDid || !exchangeKey) throw new Error('bad message')

            // add the device here...
            const newId = await addDeviceToIdentity(
                id.value as Identity,
                crypto,
                newDid,
                exchangeKey
            )

            id.value = newId

            partySocket.send(JSON.stringify(newId))
            partySocket.close()
        })
    }

    /**
     * Merge this with an existing Identity
     *   - the existing device should have already created a room
     */
    async function join (ev:SubmitEvent) {
        ev.preventDefault()
        const el = (ev.target as HTMLFormElement).elements['pin']
        const pin = el.value

        const partySocket = new PartySocket({
            host: 'localhost:1999',
            room: pin,
            query: {
                token: import.meta.env.VITE_PARTY_TOKEN
            },
        })

        partySocket.addEventListener('message', async (ev) => {
            // we should only get 1 message,
            // the new identity record, with the AES key encrypted to us
            try {
                id.value = z.Identity.parse(JSON.parse(ev.data))
            } catch (err) {
                console.log('bad json...', err)
            }

            status.value = 'success'
            partySocket.close()
        })

        partySocket.send(JSON.stringify({
            newDid: await writeKeyToDid(crypto),
            exchangeKey: arrayBuffer.toString(
                await crypto.keystore.publicExchangeKey()
            )
        }))
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
                <code>
                    {code}
                </code>
                <p>Enter this PIN on the new device.</p>
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

        {status.value === 'success' ?
            (<div className="success">
                Success! <br /> Added this device to the identity: <code>
                    {id.value?.username}
                </code>
                <div className="human-name">
                    <em>or </em>"{id.value?.humanName}"
                </div>
            </div>) :
            null
        }

        {!status.value ?
            (<div className="add-or-join">
                <form onSubmit={addDevice}>
                    <Button type="submit">Add a device</Button>
                </form>

                <hr />

                <form onSubmit={addToExisting}>
                    <Button type="submit">
                        Connect this device to another identity
                    </Button>
                </form>
            </div>) :
            null
        }

        <hr />

        <div className="identity">
            <strong>This device DID:</strong>
            <pre>
                <code>{myDid}</code>
            </pre>

            <strong>The identity:</strong>
            <pre>
                <code>{JSON.stringify(id.value, null, 2)}</code>
            </pre>
        </div>

    </div>)
}
