const Socket = require("socket.io/lib/socket");
import SimpleUserRecord from "../models/SimpleUserRecord";

declare module "socket.io" {
  interface Socket {
    getGameKey(this: typeof Socket): string;
    getUserRecord(this: typeof Socket): SimpleUserRecord;
    getLoggingMeta(this: typeof Socket): string;
  }
}

function getGameKey(this: typeof Socket): string {
  return this.handshake.query.gameKey;
}

function getUserRecord(this: typeof Socket): SimpleUserRecord {
  return this.request.userRecord;
}

function getLoggingMeta(this: typeof Socket): string {
  return this.getUserRecord().displayName;
}

Socket.prototype.getGameKey = getGameKey;
Socket.prototype.getUserRecord = getUserRecord;
Socket.prototype.getLoggingMeta = getLoggingMeta;
