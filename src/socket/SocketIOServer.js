
const SoketServer = require('socket.io');
const SocketEvents = require('./SocketEvents.js')
const socketIOAuthMiddleware = require('../middlewares/socketAccessTokenAuthMiddleware.js');
const RoomEventHandlerService = require('../services/RoomEventHandlerService.js');
import GameEventHandlerService from '../services/GameEventHandlerService'

const util = require('util');

class SocketIOServer {

    constructor(httpServer) {
        this.socketServer = SoketServer(httpServer)
        this.gameEventHandlerService = new GameEventHandlerService(this.socketServer)
        this.roomEventHandlerService = new RoomEventHandlerService(this.socketServer)
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

            // console.log("******************************* " + socket['gameKey'])

            socket.join(socket.gameKey, (err) => {
                this.roomEventHandlerService.handleJoin(socket, err)
                this.gameEventHandlerService.handleJoin(socket)
            })

            socket.on('disconnect', () => {
                this.roomEventHandlerService.handleLeave(socket)
                this.gameEventHandlerService.handleLeave(socket)
            });

            socket.on(SocketEvents.ROOM.FETCH_USER_RECORDS, (data) => {
                this.roomEventHandlerService.handleFetchUserRecords(socket)
            })

            socket.on(SocketEvents.GAME.REQUEST_START_GAME, async (data) => {
                this.gameEventHandlerService.handleStartGame(socket)
            })

            socket.on(SocketEvents.GAME.REQUEST_GAME_SCREEN_STATE, (data) => {
                this.gameEventHandlerService.handleGameScreenState(socket)
            })

            socket.on(SocketEvents.GAME.DRAWING_EVENT, (data) => {
                this.gameEventHandlerService.handleDrawingEvent(socket, data)
            })

            socket.on(SocketEvents.GAME.ANSWER_EVENT, (data) => {
                console.log(`Answer ${data}`)
            })

        })
    }


}

module.exports = SocketIOServer