import { Signal, signal } from '@preact/signals'
import Route from 'route-event'
import { program as createProgram } from '@oddjs/odd'
import { Implementation } from '@oddjs/odd/components/crypto/implementation'
import { Identity, create as createId } from '../src/index.js'
import { DID, writeKeyToDid } from '@ssc-half-light/util'

/**
 * Setup any state
 *   - routes
 */
export async function State ():Promise<{
    route:Signal<string>;
    identity:Signal<Identity|null>;
    myDid:Signal<DID>;
    _crypto:Implementation;
    _setRoute:(path:string)=>void;
}> {  // eslint-disable-line indent
    const onRoute = Route()

    const program = await createProgram({
        namespace: { creator: 'identity', name: 'example' },
        debug: true
    })

    const _crypto = program.components.crypto

    const state = {
        _setRoute: function (newPath) {
            onRoute.setRoute(
                location.pathname.includes('identity') ?  // for gh pages
                    `/identity/${newPath}` :
                    newPath
            )
        },
        _crypto,
        myDid: signal(await writeKeyToDid(_crypto)),
        identity: signal(null),
        route: signal<string>(location.pathname + location.search)
    }

    /**
     * Listen for route changes
     */
    onRoute((path:string) => {
        const newPath = path.replace('/identity/', '/')  // for github pages
        state.route.value = newPath
    })

    return state
}

export async function createIdentity (
    state:Awaited<ReturnType<typeof State>>,
    humanName:string
) {
    const program = await createProgram({
        namespace: { creator: 'identity', name: 'example' },
        debug: true
    })

    const crypto = program.components.crypto

    const id = await createId(crypto, { humanName })

    state.identity.value = id
}

export function linkSuccess (
    state:Awaited<ReturnType<typeof State>>,
    newIdRecord:Identity
) {
    state.identity.value = newIdRecord
    // for gh pages
    state._setRoute(location.pathname.includes('identity') ? '/dentity/' : '/')
}
