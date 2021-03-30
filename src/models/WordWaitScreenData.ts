import SimpleUserRecord from "./SimpleUserRecord"

class WordWaitScreenData {
    private maxWordSelectionTimeInSeconds: number
    private drawingUserRecord: SimpleUserRecord

    static create(maxWordSelectionTimeInSeconds: number, drawingUserRecord: SimpleUserRecord): WordWaitScreenData {
        return new WordWaitScreenData(maxWordSelectionTimeInSeconds, drawingUserRecord)
    }

    constructor(maxWordSelectionTimeInSeconds: number, drawingUserRecord: SimpleUserRecord) {
        this.maxWordSelectionTimeInSeconds = maxWordSelectionTimeInSeconds
        this.drawingUserRecord = drawingUserRecord
    }

    toJson(): string {
        return JSON.stringify(this)
    }
}

export default WordWaitScreenData