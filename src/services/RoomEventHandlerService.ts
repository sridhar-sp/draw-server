require('../socket/Extension')
import SocketEvents from '../socket/SocketEvents'
import { Server, Socket } from 'socket.io';
import ErrorResponse from '../models/ErrorResponse'
import SimpleUserRecord from '../models/SimpleUserRecord';
import SuccessResponse from '../models/SuccessResponse'

class RoomEventHandlerService {
    socketServer: Server

    constructor(socketServer: Server) {
        this.socketServer = socketServer

    }

    handleJoin(socket: Socket, errJoiningRoom: Error) {
        console.log(`user joined ${socket.id}`);

        const response = (errJoiningRoom == null) ? SuccessResponse.createSuccessResponse("Joined the room") :
            ErrorResponse.createErrorResponse(500, "Failed to join room")

        socket.emit(SocketEvents.Room.JOINED, response)
        socket.to(socket.getGameKey()).emit(SocketEvents.Room.MEMBER_ADD,
            SuccessResponse.createSuccessResponse(socket.getUserRecord()))
    }

    handleLeave(socket: Socket) {
        console.log(`user disconnected ${socket.id}`);
        socket.leave(this._getGameKeyFromSocket(socket))
        socket.to(this._getGameKeyFromSocket(socket)).emit(SocketEvents.Room.MEMBER_LEFT,
            SuccessResponse.createSuccessResponse(socket.getUserRecord()))
    }

    async handleFetchUserRecords(socket: Socket) {
        console.log("Fetch user records")
        this._getAllSocketDetailsFromRoom(this.socketServer, socket.getGameKey())
            .then(userRecords => {
                socket.emit(SocketEvents.Room.USER_RECORD_LIST, SuccessResponse.createSuccessResponse(userRecords))
            }).catch(error => {
                socket.emit(SocketEvents.Room.USER_RECORD_LIST, ErrorResponse.createErrorResponse(500, error))
            })
    }

    _getAllSocketDetailsFromRoom(socketServer: Server, roomId: string) {
        return new Promise((resolve: (userRecords: Array<SimpleUserRecord>) => void, reject: (error: string) => void) => {
            socketServer.in(roomId).clients(function (error: any, clients: Array<string>) {
                if (error) {
                    reject(`"Error while fetching socket information from room : ${roomId}`)
                    return
                }

                const userRecords: Array<SimpleUserRecord> = []
                clients.forEach(clientId => {
                    const socket = socketServer.sockets.connected[clientId]
                    if (socket && socket.request.userRecord)
                        userRecords.push(socket.request.userRecord)
                });

                resolve(userRecords)
            });
        })
    }

    _getGameKeyFromSocket(socket: Socket): string {
        return socket.handshake.query.gameKey
    }

}

export default RoomEventHandlerService