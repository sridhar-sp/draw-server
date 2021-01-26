import CreateGameRequest from "./CreateGameRequest"

class SimpleGameInfo extends CreateGameRequest {
    public gameKey: string

    static createSimpleGameInfo(gameKey: string, noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number) {
        return new SimpleGameInfo(gameKey, noOfRounds, maxDrawingTime, maxWordSelectionTime);
    }

    private constructor(gameKey: string, noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number) {
        super(noOfRounds, maxDrawingTime, maxWordSelectionTime)
        this.gameKey = gameKey
    }
}

export default SimpleGameInfo