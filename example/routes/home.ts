import { html } from 'htm/preact'
import { ButtonLink } from '@nichoth/components/htm/button-link'
import { FunctionComponent } from 'preact'
import '@nichoth/components/button.css'

export const HomeRoute:FunctionComponent = function () {
    return html`<div class="route home">
        <div class="control">
            <p>
                Create a new identity
            </p>
            <${ButtonLink} href="/create">Create identity<//>
        </div>

        <hr />

        <div class="control">
            <p>
                Connect this device to an existing identity
            </p>
            <${ButtonLink} href="/connect">Connect<//>
        </div>
    </div>`
}
