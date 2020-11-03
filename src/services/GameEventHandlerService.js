const GamePlayInfoRepository = require('../repositories/GamePlayInfoRepository')
const SuccessResponse = require('../models/SuccessResponse.js')
const GamePlayInfo = require('../models/GamePlayInfo.js')
const GameScreen = require('../models/GameScreen.js')
const SocketEvents = require('../socket/SocketEvents.js')

class GameEventHandlerService {

    constructor(socketServer) {
        this.socketServer = socketServer
        this.gamePlayInfoResposioty = new GamePlayInfoRepository()
    }

    handleJoin(socket) {
        const memberCount = this.socketServer.sockets.adapter.rooms[socket.gameKey].length
        if (memberCount == 1)
            this.gamePlayInfoResposioty.createGameInfo(socket.gameKey)
    }

    async handleStartGame(socket) {
        const result = await this.gamePlayInfoResposioty.updateGameStatus(socket.gameKey,
            GamePlayInfo.GamePlayStatus.STARTED)

        socket.admin = true
        this.socketServer.in(socket.gameKey).emit(SocketEvents.GAME.START_GAME)
    }

    handleGameScreenState(socket) {
        const gameScreenState = socket.admin ? GameScreen.State.DRAW : GameScreen.State.VIEW
        console.log("gameScreenState " + gameScreenState)
        socket.emit(SocketEvents.GAME.GAME_SCREEN_STATE_RESULT,
            SuccessResponse.createSuccessResponse(gameScreenState))
    }

    handleDrawingEvent(socket, data) {
        socket.to(socket.gameKey).emit(SocketEvents.GAME.DRAWING_EVENT, data)
    }
}

module.exports = GameEventHandlerService