import { html } from 'htm/preact'
import { ButtonLink } from '@nichoth/components/htm/button-link'
import { FunctionComponent } from 'preact'
import { Toaster } from '@nichoth/components/htm/toast'
import { State, ClearMessage } from '../state.js'
import '@nichoth/components/toast.css'
import '@nichoth/components/close-btn.css'
import '@nichoth/components/button.css'

export const HomeRoute:FunctionComponent<{
    state:Awaited<ReturnType<typeof State>>
}> = function ({ state }) {
    function closeToast (ev:MouseEvent) {
        ev.preventDefault()
        ClearMessage(state)
    }

    if (state.identity.value) {
        /* eslint-disable */
        return html`<div className="identity">
            <div class="this-device-did">
                <strong>This device DID:</strong>
                <pre>
                    <code>${state.identity.value?.rootDID}</code>
                </pre>
            </div>

            <strong>Devices</strong>
            <dl class="device-list">
                ${Object.keys(state.identity.value.devices || {}).map(k => {
                    const device = state.identity.value?.devices[k]
                    return html`
                        <dt>${k}:</dt>
                        <dd>${device?.humanReadableName}</dd>
                    `
                })}
            </dl>

            <strong>Your identity:</strong>
            <pre>
                <code>
                    ${JSON.stringify(state.identity.value, null, 2)}
                </code>
            </pre>

            <hr />

            <div className="controls">
                <p>Link a device to your identity</p>
                <${ButtonLink} href="/link-device">Link another device<//>
            </div>

            ${state.linkStatus.value ?
                html`<${Toaster} type="success" onClose=${closeToast}>
                    Success adding device
                <//>` :
                null
            }
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
