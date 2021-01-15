import SimpleUserRecord from "../models/SimpleUserRecord";
import { Server, Socket } from "socket.io";

class SocketUtils {
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
}

export default SocketUtils;
