
const SoketServer = require('socket.io');
const SocketEvents = require('./SocketEvents.js')
const socketIOAuthMiddleware = require('../middlewares/socketAccessTokenAuthMiddleware.js');
const ErrorResponse = require('../models/ErrorResponse.js')
const SuccessResponse = require('../models/SuccessResponse.js')

const util = require('util')

class SocketIOServer {

    constructor(httpServer) {
        this.socketServer = SoketServer(httpServer)
    }

    static bind(httpServer) {
        return new SocketIOServer(httpServer)
    }

    build() {
        this._attachAuthMiddleware()

        this._setup()
    }

    _attachAuthMiddleware() {
        this.socketServer.use(socketIOAuthMiddleware)
    }

    _setup() {
        this.socketServer.on("connection", socket => {
            console.log(`Socket connected ${socket.id}
            Gamekey = ${socket.gameKey} 
            name = ${socket.userRecord.displayName}`)

            socket.join(socket.gameKey, (err) => {
                console.log(`user joined ${socket.id}`);

                const response = (err == null) ? SuccessResponse.createSuccessResponse("Joined the room") :
                    ErrorResponse.createErrorResponse(500, "Failed to join room")

                socket.emit(SocketEvents.ROOM.JOINED, response)
                socket.broadcast.emit(SocketEvents.ROOM.MEMBER_ADD,
                    SuccessResponse.createSuccessResponse(socket.userRecord))
            })

            socket.on('disconnect', function () {
                console.log(`user disconnected ${socket.id}`);
                socket.broadcast.emit(SocketEvents.ROOM.MEMBER_LEFT,
                    SuccessResponse.createSuccessResponse(socket.userRecord))
            });

            socket.on(SocketEvents.ROOM.FETCH_USER_RECORDS, (data) => {
                this._getAllSocketDetailsFromRoom(socket.gameKey)
                    .then(userRecords => {
                        socket.emit(SocketEvents.ROOM.USER_RECORD_LIST, SuccessResponse.createSuccessResponse(userRecords))
                    }).catch(error => {
                        socket.emit(SocketEvents.ROOM.USER_RECORD_LIST, ErrorResponse.createErrorResponse(500, err))
                    })
            })

        })
    }

    _getAllSocketDetailsFromRoom(roomId) {
        const self = this
        return new Promise((resolve, reject) => {
            self.socketServer.in(roomId).clients(function (error, clients) {
                if (error) {
                    resolve(`"Error while fetching socket information from room : ${roomId}`)
                    return
                }

                const userRecords = []
                clients.forEach(clientId => {
                    const socket = self.socketServer.sockets.connected[clientId]
                    if (socket && socket.userRecord)
                        userRecords.push(socket.userRecord)
                });


                resolve(userRecords)
            });
        })

    }

    _foo() {
        this.socketServer.on("connection", socket => {

            socket.on("global_channel", data => {
                console.log(`global_channel ${socket.id} ${data}`)

                socket.broadcast.emit("global_channel", data)

                console.log("Room details acccess from main " + getObjInfo(socketIOServer.adapter.rooms))

                this.socketServer.to("play_area").emit("global_channel", "Data emitted for room" + data)

                // if (data.indexOf('1') != -1) {
                //     socket.broadcast.emit("global_channel", `broadcasting from ${socket.id} msg is ${data}`)
                // } else if (data.indexOf('2') != -1) {
                //     socket.emit("global_channel", "Sending data to onlt the specific socket")
                // } else {
                //     server.emit("global_channel", `Server sending to all ${data}`)
                // }

            })
        })
    }

    getObjInfo(obj) {
        return util.inspect(obj, false, null, true);
    }

}

module.exports = SocketIOServer