import './Extension'
import SocketEvents from './SocketEvents'
import socketIOAuthMiddleware from '../middlewares/socketAccessTokenAuthMiddleware';
import RoomEventHandlerService from '../services/RoomEventHandlerService';
import GameEventHandlerService from '../services/GameEventHandlerService'

import socketIo from 'socket.io';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

class SocketIOServer {

    socketServer: SocketIO.Server
    gameEventHandlerService: GameEventHandlerService
    roomEventHandlerService: RoomEventHandlerService

    constructor(httpServer: HttpServer | HttpsServer) {
        this.socketServer = socketIo(httpServer)
        this.gameEventHandlerService = new GameEventHandlerService(this.socketServer)
        this.roomEventHandlerService = new RoomEventHandlerService(this.socketServer)
    }

    static bind(httpServer: any) {
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
            Gamekey = ${socket.handshake.query.gameKey} 
            name = ${socket.request.userRecord.displayName}`)

            socket.join(socket.getGameKey(), (err) => {
                this.roomEventHandlerService.handleJoin(socket, err)
                this.gameEventHandlerService.handleJoin(socket)
            })

            socket.on('disconnect', () => {
                this.roomEventHandlerService.handleLeave(socket)
                this.gameEventHandlerService.handleLeave(socket)
            });

            socket.on(SocketEvents.Room.FETCH_USER_RECORDS, (data) => {
                this.roomEventHandlerService.handleFetchUserRecords(socket)
            })

            socket.on(SocketEvents.Game.REQUEST_START_GAME, async (data) => {
                this.gameEventHandlerService.handleStartGame(socket)
            })

            socket.on(SocketEvents.Game.REQUEST_GAME_SCREEN_STATE, (data) => {
                this.gameEventHandlerService.handleGameScreenState(socket)
            })

            socket.on(SocketEvents.Game.DRAWING_EVENT, (data) => {
                this.gameEventHandlerService.handleDrawingEvent(socket, data)
            })

            socket.on(SocketEvents.Game.ANSWER_EVENT, (data) => {
                console.log(`Answer ${data}`)
            })

        })
    }

}

export default SocketIOServer