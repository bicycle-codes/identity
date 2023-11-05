import { html } from 'htm/preact'
import { TextInput } from '@nichoth/components/htm/text-input'
import { ReactiveForm } from '@nichoth/components/htm/reactive-form'
import { FunctionComponent } from 'preact'
import { State, createIdentity } from '../state'
import '@nichoth/components/text-input.css'

export const Create:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    async function submit (ev:SubmitEvent) {
        ev.preventDefault()
        const humanName = (ev.target as HTMLFormElement)
            .elements['human-name'].value
        await createIdentity(state, humanName)
        state._setRoute('/')
    }

    return html`<div class="route create">
        <h2>Create a new identity</h2>

        <${ReactiveForm} onSubmit=${submit} buttonText="Create">
            <${TextInput} displayName="Human Name" name="human-name" required
                minlength=${3}
            />
        <//>
    </div>`
}
