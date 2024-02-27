import type * as Party from 'partykit/server'

export default class WebSocketServer implements Party.Server {
    party:Party.Room
    existingDevice:string = ''

    constructor (party:Party.Room) {
        this.party = party
    }

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
     *   - If this is a new room, Would want to call a DB to check that the
     *     given DID is ok. A new room means that this is a request from an
     *     existing device.
     *   - If this room already exists (if we already have an `existingDevice`),
     *     then the connection should be from a new device.
     */
    static async onBeforeConnect (request:Party.Request) {
        try {
            // get authentication server url from environment variables (optional)
            // const issuer = lobby.env.CLERK_ENDPOINT || DEFAULT_CLERK_ENDPOINT
            // get token from request query string
            const token = new URL(request.url).searchParams.get('token') ?? ''
            // verify the JWT (in this case using clerk)
            // const session = await verifyToken(token, { issuer })
            if (token !== '894b4ec9') throw new Error('bad token')
            return request  // forward the request onwards to onConnect
        } catch (err) {
            // authentication failed!
            // short-circuit the request before it's forwarded to the party
            return new Response('Unauthorized', { status: 401 })
        }
    }

    onMessage (message:string, sender:Party.Connection) {
        // the only message we should get is the new DID
        // need to tell the existing device the new DID

        if (!this.existingDevice) {
            // Should not happen.
            throw new Error('Got a message before an existing device connected')
        }

        this.party.broadcast(
            message,
            [sender.id]  // don't send to sender's ID
        )
    }
}
