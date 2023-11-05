import Router from '@nichoth/routes'
import { HomeRoute } from './home.js'
import { Create } from './create.js'
import { LinkDevice } from './link-device.js'
import { Connect } from './connect.js'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/create', () => {
        return Create
    })

    router.addRoute('/connect', () => {
        return Connect
    })

    router.addRoute('/link-device', () => {
        return LinkDevice
    })

    return router
}
