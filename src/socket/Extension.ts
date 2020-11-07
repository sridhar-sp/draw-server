const Socket = require('socket.io/lib/socket')
import SimpleUserRecord from '../models/SimpleUserRecord';

declare module 'socket.io' {
    interface Socket {
        getGameKey(this: typeof Socket): string
        getUserRecord(this: typeof Socket): SimpleUserRecord
    }
}

function getGameKey(this: typeof Socket): string {
    return this.handshake.query.gameKey
}

function getUserRecord(this: typeof Socket): SimpleUserRecord {
    return this.request.userRecord
}

Socket.prototype.getGameKey = getGameKey;
Socket.prototype.getUserRecord = getUserRecord;
