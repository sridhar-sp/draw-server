const SocketEvents = require('../socket/SocketEvents.js')
import ErrorResponse from '../models/ErrorResponse'
import SuccessResponse from '../models/SuccessResponse'

class RoomEventHandlerService {

    constructor(socketServer) {
        this.socketServer = socketServer
    }

    handleJoin(socket, errJoiningRoom) {
        console.log(`user joined ${socket.id}`);

        const response = (errJoiningRoom == null) ? SuccessResponse.createSuccessResponse("Joined the room") :
            ErrorResponse.createErrorResponse(500, "Failed to join room")

        socket.emit(SocketEvents.ROOM.JOINED, response)
        socket.to(socket.gameKey).emit(SocketEvents.ROOM.MEMBER_ADD,
            SuccessResponse.createSuccessResponse(socket.userRecord))
    }

    handleLeave(socket) {
        console.log(`user disconnected ${socket.id}`);
        socket.leave(socket.gameKey)
        socket.to(socket.gameKey).emit(SocketEvents.ROOM.MEMBER_LEFT,
            SuccessResponse.createSuccessResponse(socket.userRecord))
    }

    async handleFetchUserRecords(socket) {
        console.log("Fetch user records")
        this._getAllSocketDetailsFromRoom(this.socketServer, socket.gameKey)
            .then(userRecords => {
                socket.emit(SocketEvents.ROOM.USER_RECORD_LIST, SuccessResponse.createSuccessResponse(userRecords))
            }).catch(error => {
                socket.emit(SocketEvents.ROOM.USER_RECORD_LIST, ErrorResponse.createErrorResponse(500, err))
            })
    }

    _getAllSocketDetailsFromRoom(socketServer, roomId) {
        return new Promise((resolve, reject) => {
            socketServer.in(roomId).clients(function (error, clients) {
                if (error) {
                    resolve(`"Error while fetching socket information from room : ${roomId}`)
                    return
                }

                const userRecords = []
                clients.forEach(clientId => {
                    const socket = socketServer.sockets.connected[clientId]
                    if (socket && socket.userRecord)
                        userRecords.push(socket.userRecord)
                });

                resolve(userRecords)
            });
        })

    }

}

module.exports = RoomEventHandlerService