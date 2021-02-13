import SimpleUserRecord from "./SimpleUserRecord"

class UserScore {
    score: number
    userRecord: SimpleUserRecord

    public static create(score: number, userRecord: SimpleUserRecord): UserScore {
        return new UserScore(score, userRecord)
    }

    private constructor(score: number, userRecord: SimpleUserRecord) {
        this.score = score
        this.userRecord = userRecord
    }
}

export default UserScore