// server.ts
import type * as Party from 'partykit/server'

// export default class WebSocket implements Party.Server {}

export default class WebSocketServer implements Party.Server {
    // constructor (readonly party: Party.Party) {}

    onMessage (message: string, sender: Party.Connection) {
        // send the message to all connected clients
        for (const conn of this.party.getConnections()) {
            if (conn.id !== sender.id) {
                conn.send(`${sender.id} says: ${message}`);
            }
        }
    }
}
