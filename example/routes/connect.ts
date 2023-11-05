import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import PartySocket from 'partysocket'
import { writeKeyToDid } from '@ssc-half-light/util'
import { Button } from '@nichoth/components/htm/button'
import * as z from '../../src/z.js'
import { arrayBuffer } from '../../src/index.js'
import { State, linkSuccess } from '../state.js'

export const Connect:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    const isValidPin = useSignal<boolean>(false)
    const isSpinning = useSignal<boolean>(false)

    /**
    * Merge this with an existing Identity
    *   - the existing device should have already created a room
    */
    async function handleSubmit (ev:SubmitEvent) {
        ev.preventDefault()

        const el = (ev.target as HTMLFormElement).elements['pin']
        const pin = el.value

        const serverAddress = (import.meta.env.DEV ?
            'localhost:1999' :
            'identity-party.nichoth.partykit.dev')

        const partySocket = new PartySocket({
            host: serverAddress,
            room: pin,
            query: {
                token: import.meta.env.VITE_PARTY_TOKEN
            },
        })

        /**
         * Get a message with the new ID record,
         *   with the AES key encrypted to us
         */
        partySocket.addEventListener('message', async (ev) => {
            // we should only get 1 message, the new identity
            //   (the ID including this device)
            try {
                linkSuccess(state, z.Identity.parse(JSON.parse(ev.data)))
            } catch (err) {
                console.log('bad json...', err)
                throw err
            }

            partySocket.close()
        })

        /**
         * Send our DID to the existing device
         */
        partySocket.send(JSON.stringify({
            newDid: await writeKeyToDid(state._crypto),
            exchangeKey: arrayBuffer.toString(
                await state._crypto.keystore.publicExchangeKey()
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

    // need this because `onInput` event doesnt work for cmd + delete event
    function onFormKeydown (ev:KeyboardEvent) {
        const key = ev.key
        const { form } = ev.target as HTMLInputElement
        if (!form) return
        if (key !== 'Backspace' && key !== 'Delete') return

        const _isValid = form.checkValidity()
        if (_isValid !== isValidPin.value) isValidPin.value = _isValid
    }

    return html`<div class="route connect">
        <h2>Connect to an existing identity</h2>

        <form
            class="pin-form"
            onKeyDown=${onFormKeydown}
            onSubmit=${handleSubmit}
        >
            <p>Enter the PIN here from the parent device</p>

            <div class="pin-input">
                <input name="pin" className="pin" type="number"
                    minlength=${6}
                    maxlength=${6}
                    autoComplete="off"
                    inputMode="numeric"
                    required=${true}
                    id="pin-input"
                    onInput=${pinInput}
                />
            </div>

            <${Button}
                isSpinning=${isSpinning}
                disabled=${!isValidPin.value}
                type="submit"
            >
                Link devices
            <//>
        </form>
    </div>`
}
