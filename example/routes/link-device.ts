import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import PartySocket from 'partysocket'
import { add as addDeviceToIdentity } from '../../src'
import { customAlphabet } from '@nichoth/nanoid'
import { numbers } from '@nichoth/nanoid-dictionary'
import { State } from '../state'
import '@nichoth/components/text-input.css'

const serverAddress = (import.meta.env.DEV ?
    'localhost:1999' :
    'identity-party.nichoth.partykit.dev')

type Message = {
    newDid:`did:key:z${string}`,
    exchangeKey:string
}

/**
 * This is the route where we create a PIN, and ask the new
 *   device to enter the PIN.
 * So you have to transmit the PIN out of band.
 */

export const LinkDevice:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    const code = useSignal<string>('')
    const linkStatus = useSignal<'linked'|'pending'>('pending')

    useEffect(() => {
        /**
         * @TODO
         * Use full (lowercase) alphabet, for less chance of collision?
         */
        const PIN = customAlphabet(numbers, 6)
        code.value = ('' + PIN())

        /**
         * connect to our server
         */
        const partySocket = new PartySocket({
            host: serverAddress,
            room: code.value,
            id: state.myDid.value,
            query: {
                token: import.meta.env.VITE_PARTY_TOKEN,
            },
        })

        partySocket.addEventListener('message', async (ev) => {
            // we should only get one message containing the DID
            //   and exchangeKey of the new device
            console.log('from the server: ', ev.data)

            let msg:Message
            try {
                msg = JSON.parse(ev.data)
            } catch (err) {
                console.log('errr', err)
                throw new Error('bad json')
            }

            const { newDid, exchangeKey } = msg
            if (!newDid || !exchangeKey) throw new Error('bad message')

            // our own identity should exist at this point
            if (!state.identity.value) throw new Error('not identity')

            const newIdentity = await addDeviceToIdentity(
                state.identity.value,
                state._crypto,
                newDid,
                exchangeKey
            )

            partySocket.send(JSON.stringify(newIdentity))
            linkStatus.value = 'linked'
            partySocket.close()
        })

        return () => partySocket.close()
    }, [])

    return html`<div class="route link">
        <h2>Add a new device to this identity</h2>

        ${linkStatus.value === 'linked' ?
            html`<div className="success">
                <p>Linked a new device</p>
            </div>` :
            html`<div className="the-pin">
                <code>${code}</code>
                <p>Enter this PIN on the new device.</p>
            </div>`
        }
    </div>`
}

