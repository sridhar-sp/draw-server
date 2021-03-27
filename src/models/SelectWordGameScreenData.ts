class SelectWordGameScreenData {

    private maxWordSelectionTimeInSeconds: number

    static create(maxWordSelectionTimeInSeconds: number): SelectWordGameScreenData {
        return new SelectWordGameScreenData(maxWordSelectionTimeInSeconds)
    }

    constructor(maxWordSelectionTimeInSeconds: number) {
        this.maxWordSelectionTimeInSeconds = maxWordSelectionTimeInSeconds;
    }

    toJson(): string {
        return JSON.stringify(this)
    }
}

export default SelectWordGameScreenData