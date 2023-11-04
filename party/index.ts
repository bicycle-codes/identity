import type * as Party from 'partykit/server'

export default class Server implements Party.Server {
    constructor (readonly party: Party.Party) {}

    onConnect (conn: Party.Connection, ctx: Party.ConnectionContext) {
        console.log(
            `Connected:
            id: ${conn.id}
            room: ${this.party.id}
            url: ${new URL(ctx.request.url).pathname}`
        )

        // let's send a message to the connection
        conn.send('hello from server')
    }

    onMessage (message: string, sender: Party.Connection) {
        // let's log the message
        console.log(`connection ${sender.id} sent message: ${message}`)
        // as well as broadcast it to all the other connections in the room...
        this.party.broadcast(
            `${sender.id}: ${message}`,
            [sender.id]  // ...except for the connection it came from
        )
    }
}

Server satisfies Party.Worker

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
