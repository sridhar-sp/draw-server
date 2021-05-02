import UserScore from "./UserScore"

class LeaderBoardData {
    private leaderBoard: Array<UserScore>
    private word: string
    private currentRound: number
    private totalRounds: number
    private currentMatchIndex: number
    private isGameFinished: Boolean
    private leaderBoardTimeOutInSeconds: number

    static create(leaderBoard: Array<UserScore>, word: string, currentRound: number, totalRounds: number,
        currentMatchIndex: number, isGameFinished: Boolean, leaderBoardTimeOutInSeconds: number): LeaderBoardData {
        return new LeaderBoardData(leaderBoard, word, currentRound, totalRounds, currentMatchIndex, isGameFinished, leaderBoardTimeOutInSeconds)
    }

    constructor(leaderBoard: Array<UserScore>, word: string, currentRound: number, totalRounds: number,
        currentMatchIndex: number, isGameFinished: Boolean, leaderBoardTimeOutInSeconds: number) {
        this.leaderBoard = leaderBoard
        this.word = word
        this.currentRound = currentRound
        this.totalRounds = totalRounds
        this.currentMatchIndex = currentMatchIndex
        this.isGameFinished = isGameFinished
        this.leaderBoardTimeOutInSeconds = leaderBoardTimeOutInSeconds
    }

    toJson(): string {
        return JSON.stringify(this)
    }

    isGameCompleted(): Boolean {
        return this.isGameFinished
    }

}

export default LeaderBoardData