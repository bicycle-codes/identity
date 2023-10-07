import type * as Party from 'partykit/server'

export default class WebSocketServer implements Party.Server {
    existingDevice:string = ''

    constructor (readonly party: Party.Party) {}

    /**
     * @TODO
     */
    onConnect (conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(
            `Connected:
            id: ${conn.id}
            room: ${this.party.id}
            url: ${new URL(ctx.request.url).pathname}`
        )

        // we use the DID as the id
        if (!this.existingDevice) {
            // this is a new room. The first connection should be the
            //   existing device
            this.existingDevice = conn.id
        }
    }

    /**
     * @TODO implement this
     *   - Would want to call a DB to check that the given DID is ok if
     *     this is a new connection. A new room means that this is a
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
            if (token !== 'aaaaa') throw new Error('bad token')
            // pass any information to the onConnect handler in headers (optional)
            request.headers.set('X-User-ID', 'aaaaa')
            // request.headers.set('X-User-ID', session.sub)
            // forward the request onwards on onConnect
            return request
        } catch (err) {
            // authentication failed!
            // short-circuit the request before it's forwarded to the party
            return new Response('Unauthorized', { status: 401 })
        }
    }

    onMessage (message:string, sender:Party.Connection) {
        console.log(`**${sender.id}** sent message: ${message}`)

        // the only message we should get is the new DID
        // need to tell the existing device the new DID, so they can sign
        //   a UCAN authorizing

        if (!this.existingDevice) {
            // Should not happen.
            // We only get 1 message, from the new device
            return
        }

        this.party.broadcast(
            message,
            [sender.id]
        )
    }
}
