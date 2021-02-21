import SimpleUserRecord from "../models/SimpleUserRecord";
import { Server, Socket } from "socket.io";
import logger from "../logger/logger";

class SocketUtils {

  private static TAG = "SocketUtils"

  static getAllSocketFromRoom(socketServer: Server, roomId: string): Promise<Array<Socket>> {
    return new Promise((resolve: (socketList: Array<Socket>) => void, reject: (error: Error) => void) => {
      socketServer.in(roomId).clients(function (error: any, clients: Array<string>) {
        if (error) {
          reject(new Error(`Error while fetching socket information from room : ${roomId}`));
          return;
        }

        resolve(clients.map((clientId) => socketServer.sockets.connected[clientId]));
      });
    });
  }

  static getAllUserRecordFromRoom(socketServer: Server, roomId: string): Promise<Array<SimpleUserRecord>> {
    return new Promise((resolve: (userRecords: Array<SimpleUserRecord>) => void, reject: (error: Error) => void) => {
      SocketUtils.getAllSocketFromRoom(socketServer, roomId)
        .then(sockets => {
          resolve(sockets.map(socket => socket.getUserRecord()))
        })
        .catch(error => {
          logger.logError(SocketUtils.TAG, error)
          resolve([])
        })
    })
  }
}

export default SocketUtils;
