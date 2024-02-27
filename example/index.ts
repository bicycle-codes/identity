import { FunctionComponent, render } from 'preact'
import { html } from 'htm/preact'
import Router from './routes/index.js'
import { State } from './state'
import './index.css'

const state = await State()
const router = Router()

// @ts-expect-error For dev env
window.state = state

const TheApp:FunctionComponent = function () {
    const match = router.match(state.route.value)
    if (!match) {
        return html`<div class="404">
            <h1>404</h1>
        </div>`
    }

    const ChildNode = match.action(match, state.route)

    return html`<div class="content">
        <h1>identity demo</h1>
        <${ChildNode} state=${state} />
    </div>`
}

render(html`<${TheApp} />`, document.getElementById('root')!)
