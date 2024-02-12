import Router from '@nichoth/routes'
import { HomeRoute } from './home.js'
import { Create } from './create.js'
import { LinkDevice } from './link-device.js'
import { Connect } from './connect.js'

export default function _Router ():ReturnType<Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/create', () => {
        return Create
    })

    /**
     * Visit this on a new device that is linking to an existing device
     */
    router.addRoute('/connect', () => {
        return Connect
    })

    /**
     * Visit this from an existing device
     * This creates the websocket room, and will listen for a message
     * from the new device.
     */
    router.addRoute('/link-device', () => {
        return LinkDevice
    })

    return router
}
