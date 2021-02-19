import UserScore from "./UserScore"

class LeaderBoardData {
    private leaderBoard: Array<UserScore>
    private isGameFinished: Boolean

    static create(leaderBoard: Array<UserScore>, isGameFinished: Boolean): LeaderBoardData {
        return new LeaderBoardData(leaderBoard, isGameFinished)
    }

    constructor(leaderBoard: Array<UserScore>, isGameFinished: Boolean) {
        this.leaderBoard = leaderBoard
        this.isGameFinished = isGameFinished
    }

    toJson(): string {
        return JSON.stringify(this)
    }

    isGameCompleted(): Boolean {
        return this.isGameFinished
    }

}

export default LeaderBoardData