import { Server, Socket } from "socket.io"

const GamePlayInfoRepository = require('../repositories/GamePlayInfoRepository')
const SuccessResponse = require('../models/SuccessResponse.js')
const GamePlayInfo = require('../models/GamePlayInfo.js')
const GameScreen = require('../models/GameScreen.js')
const SocketEvents = require('../socket/SocketEvents.js')

class GameEventHandlerService {

    socketServer: Server
    gamePlayInfoResposioty: typeof GamePlayInfoRepository

    constructor(socketServer: Server) {
        this.socketServer = socketServer;
        this.gamePlayInfoResposioty = new GamePlayInfoRepository()
    }

    async handleJoin(socket: Socket) {
        this.gamePlayInfoResposioty.addParticipant(this._getGameKeyFromSocket(socket), socket.id)
    }

    async handleLeave(socket: Socket) {
        this.gamePlayInfoResposioty.removeParticipant(this._getGameKeyFromSocket(socket), socket.id)
    }

    async handleStartGame(socket: Socket) {
        await this.gamePlayInfoResposioty.updateGameStatus(this._getGameKeyFromSocket(socket),
            GamePlayInfo.GamePlayStatus.STARTED)

        socket.handshake.headers.admin = true
        this.socketServer.in(this._getGameKeyFromSocket(socket)).emit(SocketEvents.GAME.START_GAME)
    }

    handleGameScreenState(socket: Socket) {
        const gameScreenState = socket.handshake.headers.admin ? GameScreen.State.DRAW : GameScreen.State.VIEW
        console.log("gameScreenState " + gameScreenState)
        socket.emit(SocketEvents.GAME.GAME_SCREEN_STATE_RESULT,
            SuccessResponse.createSuccessResponse(gameScreenState))
    }

    handleDrawingEvent(socket: Socket, data: Array<any>) {
        socket.to(this._getGameKeyFromSocket(socket)).emit(SocketEvents.GAME.DRAWING_EVENT, data)
    }

    _getGameKeyFromSocket(socket: Socket): string {
        return socket.handshake.query.gameKey
    }
}

module.exports = GameEventHandlerService