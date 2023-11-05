import { html } from 'htm/preact'
import { TextInput } from '@nichoth/components/htm/text-input'
import { ReactiveForm } from '@nichoth/components/htm/reactive-form'
import { FunctionComponent } from 'preact'
import '@nichoth/components/text-input.css'

export const Create:FunctionComponent = function () {
    function submit (ev:SubmitEvent) {
        ev.preventDefault()
        console.log('create new identity')
        return Sleep(2000)
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

function Sleep (ms:number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
