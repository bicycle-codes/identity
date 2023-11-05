import { Signal, signal } from '@preact/signals'
import Route from 'route-event'

/**
 * Setup any state
 *   - routes
 */
export function State ():{
    route:Signal<string>;
    _setRoute:(path:string)=>void;
} {  // eslint-disable-line indent
    const onRoute = Route()

    const state = {
        _setRoute: onRoute.setRoute.bind(onRoute),
        route: signal<string>(location.pathname + location.search)
    }

    /**
     * set the route state
     */
    onRoute((path:string) => {
        const newPath = path.replace('/identity/', '/')  // for github pages
        state.route.value = newPath
    })

    return state
}
