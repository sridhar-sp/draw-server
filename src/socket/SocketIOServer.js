
const SoketServer = require('socket.io');
const SocketEvents = require('./SocketEvents.js')
const socketIOAuthMiddleware = require('../middlewares/socketAccessTokenAuthMiddleware.js');
const GamePlayInfoRepository = require('../repositories/GamePlayInfoRepository')
const ErrorResponse = require('../models/ErrorResponse.js')
const SuccessResponse = require('../models/SuccessResponse.js')
const GamePlayInfo = require('../models/GamePlayInfo.js')
const GameScreen = require('../models/GameScreen.js')

const util = require('util')

const gamePlayInfoResposioty = new GamePlayInfoRepository()

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
                socket.to(socket.gameKey).emit(SocketEvents.ROOM.MEMBER_ADD,
                    SuccessResponse.createSuccessResponse(socket.userRecord))

                const memberCount = this.socketServer.sockets.adapter.rooms[socket.gameKey].length
                if (memberCount == 1)
                    gamePlayInfoResposioty.createGameInfo(socket.gameKey)
            })

            socket.on('disconnect', function () {
                console.log(`user disconnected ${socket.id}`);
                socket.leave(socket.gameKey)
                socket.to(socket.gameKey).emit(SocketEvents.ROOM.MEMBER_LEFT,
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

            socket.on(SocketEvents.GAME.REQUEST_START_GAME, async (data) => {

                const result = await gamePlayInfoResposioty.updateGameStatus(socket.gameKey,
                    GamePlayInfo.GamePlayStatus.STARTED)

                socket.admin = true
                this.socketServer.in(socket.gameKey).emit(SocketEvents.GAME.START_GAME)
            })

            socket.on(SocketEvents.GAME.REQUEST_GAME_SCREEN_STATE, (data) => {
                const gameScreenState = socket.admin ? GameScreen.State.DRAW : GameScreen.State.VIEW
                console.log("gameScreenState " + gameScreenState)
                socket.emit(SocketEvents.GAME.GAME_SCREEN_STATE_RESULT,
                    SuccessResponse.createSuccessResponse(gameScreenState))
            })

            socket.on(SocketEvents.GAME.DRAWING_EVENT, (data) => {
                socket.to(socket.gameKey).emit(SocketEvents.GAME.DRAWING_EVENT, data)
            })

            socket.on(SocketEvents.GAME.ANSWER_EVENT, (data) => {
                console.log(`Answer ${data}`)
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

    getObjInfo(obj) {
        return util.inspect(obj, false, null, true);
    }

}

module.exports = SocketIOServer