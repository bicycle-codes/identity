import { html } from 'htm/preact'
import { ButtonLink } from '@nichoth/components/htm/button-link'
import { FunctionComponent } from 'preact'
import { State } from '../state.js'
import '@nichoth/components/button.css'

export const HomeRoute:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    if (state.identity.value) {
        return html`<div className="identity">
            <strong>This device DID:</strong>
            <pre>
                <code>${state.identity.value?.rootDid}</code>
            </pre>

            <strong>Your identity:</strong>
            <pre>
                <code>
                    ${JSON.stringify(state.identity.value, null, 2)}
                </code>
            </pre>

            <div className="controls">
                <p>Link a device to your identity</p>
                <${ButtonLink} href="/link-device">Add another device<//>
            </div>
        </div>`
    }

    /* eslint-disable */
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
