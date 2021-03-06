import CreateGameRequest from "./CreateGameRequest"
import GamePlayStatus from "./GamePlayStatus";

class SimpleGameInfo extends CreateGameRequest {
    public gameKey: string
    public gamePlayStatus: GamePlayStatus

    static createSimpleGameInfo(gameKey: string, noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number, gamePlayStatus: GamePlayStatus) {
        return new SimpleGameInfo(gameKey, noOfRounds, maxDrawingTime, maxWordSelectionTime, gamePlayStatus);
    }

    private constructor(gameKey: string, noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number, gamePlayStatus: GamePlayStatus) {
        super(noOfRounds, maxDrawingTime, maxWordSelectionTime)
        this.gameKey = gameKey
        this.gamePlayStatus = gamePlayStatus
    }
}

export default SimpleGameInfo