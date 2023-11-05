import { html } from 'htm/preact'
import Router from '@nichoth/routes'
import { HomeRoute } from './home.js'
import { Create } from './create.js'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/create', () => {
        return Create
    })

    router.addRoute('/connect', () => {
        return () => {
            return html`<h2>connect</h2>`
        }
    })

    return router
}
