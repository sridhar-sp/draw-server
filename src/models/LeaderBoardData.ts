import UserScore from "./UserScore"

class LeaderBoardData {
    private leaderBoard: Array<UserScore>
    private currentRound: number
    private totalRounds: number
    private currentMatchIndex: number
    private isGameFinished: Boolean

    static create(leaderBoard: Array<UserScore>, currentRound: number, totalRounds: number,
        currentMatchIndex: number, isGameFinished: Boolean): LeaderBoardData {
        return new LeaderBoardData(leaderBoard, currentRound, totalRounds, currentMatchIndex, isGameFinished)
    }

    constructor(leaderBoard: Array<UserScore>, currentRound: number, totalRounds: number,
        currentMatchIndex: number, isGameFinished: Boolean) {
        this.leaderBoard = leaderBoard
        this.currentRound = currentRound
        this.totalRounds = totalRounds
        this.currentMatchIndex = currentMatchIndex
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