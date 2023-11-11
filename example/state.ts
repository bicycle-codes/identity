import { Signal, batch, signal } from '@preact/signals'
import Route from 'route-event'
import { program as createProgram } from '@oddjs/odd'
import { Implementation } from '@oddjs/odd/components/crypto/implementation'
import { Identity, create as createId } from '../src/index.js'
import { DID, writeKeyToDid } from '@ssc-half-light/util'

type AppDeviceRecord = {
    humanName:string;  // a human-readblae name
    name:string  // the random unique name
}

/**
 * Setup any state
 *   - routes
 */
export async function State ():Promise<{
    route:Signal<string>;
    identity:Signal<Identity|null>;
    linkStatus:Signal<'success'|null>;
    // key is the machine name, value is the human name
    devices:Signal<Record<string, AppDeviceRecord>|null>;
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
            onRoute.setRoute(newPath)
        },
        _crypto,
        myDid: signal(await writeKeyToDid(_crypto)),
        linkStatus: signal(null),
        devices: signal(null),
        identity: signal(null),
        route: signal<string>(location.pathname + location.search)
    }

    /**
     * Listen for route changes
     */
    onRoute((path:string) => {
        state.route.value = path
    })

    return state
}

export function ClearMessage (state:Awaited<ReturnType<typeof State>>) {
    state.linkStatus.value = null
}

/**
 * Call this from an existing device, to add a new device to this identity.
 */
export function AddDevice (
    state:Awaited<ReturnType<typeof State>>,
    newIdentity:Identity,
    newDevice:AppDeviceRecord
) {
    batch(() => {
        state.identity.value = newIdentity
        state.devices.value = Object.assign({}, state.devices.value, {
            [newDevice.name]: newDevice
        })
        state.linkStatus.value = 'success'
    })

    // for gh pages
    state._setRoute('/')
}

export async function CreateIdentity (
    state:Awaited<ReturnType<typeof State>>,
    { humanName, deviceName }:{ humanName:string, deviceName:string },
) {
    const program = await createProgram({
        namespace: { creator: 'identity', name: 'example' },
        debug: true
    })

    const crypto = program.components.crypto

    const id = await createId(crypto, { humanName })

    state.devices.value = Object.assign({}, state.devices.value, {
        // record for the first device
        [id.username]: { name: id.username, humanName: deviceName }
    })

    state.identity.value = id
}

/**
 * Call this from a new device, to say that it is part of an identity
 */
export function LinkSuccess (
    state:Awaited<ReturnType<typeof State>>,
    newIdRecord:Identity,
    newDevice:AppDeviceRecord
) {
    batch(() => {
        state.identity.value = newIdRecord
        state.devices.value = Object.assign({}, state.devices.value, {
            [newDevice.name]: newDevice
        })
        state.linkStatus.value = 'success'
    })

    state._setRoute('/')
}
