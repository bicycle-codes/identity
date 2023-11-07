import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { useComputed, useSignal } from '@preact/signals'
import PartySocket from 'partysocket'
import { writeKeyToDid } from '@ssc-half-light/util'
import { Button } from '@nichoth/components/htm/button'
import { TextInput } from '@nichoth/components/htm/text-input'
import * as z from '../../src/z.js'
import { arrayBuffer } from '../../src/index.js'
import { State, LinkSuccess } from '../state.js'

/**
 * Visit this route from a new device.
 */
export const Connect:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    const isValidPin = useSignal<boolean>(false)
    const isNameValid = useSignal<boolean>(false)
    const isFormValid = useComputed(() => {
        return isValidPin.value && isNameValid.value
    })
    const isSpinning = useSignal<boolean>(false)

    /**
    * Merge this with an existing Identity
    *   - the existing device should have already created a room
    */
    async function handleSubmit (ev:SubmitEvent) {
        ev.preventDefault()

        const pin = (ev.target as HTMLFormElement).elements['pin'].value
        const nameEl = (ev.target as HTMLFormElement).elements['device-name']
        const deviceName = nameEl.value

        const serverAddress = (import.meta.env.DEV ?
            'localhost:1999' :
            'identity-party.nichoth.partykit.dev')

        /**
         * @TODO Use a real token
         */
        const partySocket = new PartySocket({
            host: serverAddress,
            room: pin,
            query: {
                token: '894b4ec9'
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
                LinkSuccess(state, z.Identity.parse(JSON.parse(ev.data)))
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
            deviceName,
            newDid: await writeKeyToDid(state._crypto),
            exchangeKey: arrayBuffer.toString(
                await state._crypto.keystore.publicExchangeKey()
            )
        }))
    }

    function onNameInput (ev:InputEvent) {
        const isValid = (ev.target as HTMLInputElement).checkValidity()
        if (!!isValid !== isNameValid.value) isNameValid.value = !!isValid
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
            <div>
                <label>
                    Choose a name for this device
                    <${TextInput}
                        onChange=${onNameInput}
                        onInput=${onNameInput}
                        displayName="Device name"
                        required=${true}
                        minlength=${3}
                        name="device-name"
                    />
                </label>
            </div>

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
                disabled=${!isFormValid.value}
                type="submit"
            >
                Link devices
            <//>
        </form>
    </div>`
}
