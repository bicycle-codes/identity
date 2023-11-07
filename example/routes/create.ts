import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { TextInput } from '@nichoth/components/htm/text-input'
import { Button } from '@nichoth/components/htm/button'
import { useSignal } from '@preact/signals'
import { State, CreateIdentity } from '../state'
import '@nichoth/components/text-input.css'

export const Create:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    const isValid = useSignal(false)
    const isSpinning = useSignal(false)

    async function submit (ev:SubmitEvent) {
        ev.preventDefault()
        const humanName = (ev.target as HTMLFormElement)
            .elements['human-name'].value
        const deviceName = (ev.target as HTMLFormElement)
            .elements['device-name'].value

        await CreateIdentity(state, { humanName, deviceName })
        state._setRoute(location.pathname.includes('identity') ?
            '/identity/' :
            '/'
        )
    }

    function handleInput (ev:InputEvent) {
        const _isValid = (ev.target as HTMLFormElement).checkValidity()
        if (_isValid !== isValid.value) isValid.value = _isValid
    }

    return html`<div class="route create">
        <h2>Create a new identity</h2>

        <form onSubmit=${submit} buttonText="Create" onInput=${handleInput}>
            <${TextInput} displayName="Human Name" name="human-name" required
                minlength=${3}
            />

            <${TextInput} displayName="Device name" name="device-name"
                required minlength=${3}
            />

            <${Button}
                isSpinning=${isSpinning}
                disabled=${!isValid.value}
            >
                Create
            <//>
        <//>
    </div>`
}
