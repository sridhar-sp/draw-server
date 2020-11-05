const GameScreen = require('./GameScreen.js')

class Participant {

    constructor(socketId) {
        this.socketId = socketId
        this.gameScreenState = GameScreen.State.VIEW
    }

    static create(socketId) {
        return new Participant(socketId)
    }

    setGameScreenState(gameScreenState) {
        this.gameScreenState = gameScreenState
    }
}

module.exports = Participant