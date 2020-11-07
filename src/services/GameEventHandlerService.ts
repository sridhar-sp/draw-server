import { Socket } from "socket.io"

import GamePlayInfoRepository from '../repositories/GamePlayInfoRepository'
import SuccessResponse from '../models/SuccessResponse'
import GamePlayStatus from '../models/GamePlayStatus'
import GameScreen from '../models/GameScreen'
import SocketEvents from '../socket/SocketEvents'

import { Server } from 'socket.io'

class GameEventHandlerService {

    socketServer: Server
    gamePlayInfoResposioty: GamePlayInfoRepository

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
            GamePlayStatus.STARTED)

        socket.handshake.headers.admin = true
        console.log("SocketEvents.GAME.START_GAME " + SocketEvents.Game.START_GAME)
        this.socketServer.in(this._getGameKeyFromSocket(socket)).emit(SocketEvents.Game.START_GAME)
    }

    handleGameScreenState(socket: Socket) {
        const gameScreenState = socket.handshake.headers.admin ? GameScreen.State.DRAW : GameScreen.State.VIEW
        console.log("gameScreenState " + gameScreenState)
        socket.emit(SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
            SuccessResponse.createSuccessResponse(gameScreenState))
    }

    handleDrawingEvent(socket: Socket, data: Array<any>) {
        socket.to(this._getGameKeyFromSocket(socket)).emit(SocketEvents.Game.DRAWING_EVENT, data)
    }

    _getGameKeyFromSocket(socket: Socket): string {
        return socket.handshake.query.gameKey
    }
}

export default GameEventHandlerService