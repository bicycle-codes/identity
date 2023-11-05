import type * as Party from 'partykit/server'

export default class WebSocketServer implements Party.Server {
    existingDevice:string = ''

    constructor (readonly party: Party.Party) {}

    onConnect (conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(
            `Connected:
            id: ${conn.id}
            room: ${this.party.id}
            url: ${new URL(ctx.request.url).pathname}`
        )

        if (!this.existingDevice) {
            // That means this is a new room. The first connection should be
            //   the existing device
            this.existingDevice = conn.id  // we use the DID as the id
        }
    }

    /**
     * @TODO implement this
     *   - Would want to call a DB to check that the given DID is ok if
     *     this is a new room. A new room means that this is a
     *     request from an existing device.
     *   - If this room already exists (if we already have an `existingDevice`),
     *     then the connection should be from a new device.
     */
    static async onBeforeConnect (request:Party.Request, lobby:Party.Lobby) {
        try {
            // get authentication server url from environment variables (optional)
            // const issuer = lobby.env.CLERK_ENDPOINT || DEFAULT_CLERK_ENDPOINT
            // get token from request query string
            const token = new URL(request.url).searchParams.get('token') ?? ''
            // verify the JWT (in this case using clerk)
            // const session = await verifyToken(token, { issuer })
            if (token !== lobby.env.PARTY_TOKEN) throw new Error('bad token')
            return request  // forward the request onwards to onConnect
        } catch (err) {
            // authentication failed!
            // short-circuit the request before it's forwarded to the party
            return new Response('Unauthorized', { status: 401 })
        }
    }

    onMessage (message:string, sender:Party.Connection) {
        // the only message we should get is the new DID
        // need to tell the existing device the new DID, so they can sign
        //   a UCAN authorizing

        if (!this.existingDevice) {
            // Should not happen.
            throw new Error('Got a message before an existing device connected')
        }

        this.party.broadcast(
            message,
            [sender.id]
        )
    }
}

// see https://blog.partykit.io/posts/partykit-powers-realtime-avatars-in-epic-web

// > All PartyKit server code that was needed to implement the real-time avatars
// > feature to Kent’s course was the following:

/*
import type * as Party from 'partykit/server'

type UserPayload = {
    id: string
    avatarUrl: string
    name?: string | null | undefined
}

type Message =
    | { type: 'remove-user'; payload: Pick<UserPayload, 'id'> }
    | { type: 'add-user'; payload: UserPayload }
    | { type: 'presence'; payload: { users: Array<UserPayload> } }

export default class Server implements Party.Server {
    options: Party.ServerOptions = { hibernate: true }
    constructor(party: Party.Party) {
        this.party = party
    }

    updateUsers() {
        const presenceMessage = JSON.stringify(this.getPresenceMessage())
        for (const connection of this.party.getConnections<UserPayload>()) {
            connection.send(presenceMessage)
        }
    }

    getPresenceMessage(): Message {
        const users = new Map<string, UserPayload>()
        for (const connection of this.party.getConnections<UserPayload>()) {
            const user = connection.state
            if (user) users.set(user.id, user)
        }
        return {
            type: 'presence',
            payload: { users: Array.from(users.values()) },
        } satisfies Message
    }

    onMessage(message: string, sender: Party.Connection<UserPayload>) {
        const user = JSON.parse(message) as Message
        if (user.type === 'add-user') {
            sender.setState(user.payload)
            this.updateUsers()
        } else if (user.type === 'remove-user') {
            sender.setState(null)
            this.updateUsers()
        }
    }

    onClose() {
        this.updateUsers()
    }

    onError() {
        this.updateUsers()
    }
}
*/
