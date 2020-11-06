import GameScreen from './GameScreen'

class Participant {

    socketId: string
    gameScreenState: GameScreen

    constructor(socketId: string) {
        this.socketId = socketId
        this.gameScreenState = GameScreen.State.VIEW
    }

    static create(socketId: string) {
        return new Participant(socketId)
    }

    setGameScreenState(gameScreenState: GameScreen) {
        this.gameScreenState = gameScreenState
    }
}

export default Participant