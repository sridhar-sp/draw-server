class GamePlayInfo {

    static GamePlayStatus = {
        NOT_STARTED: 1,
        STARTED: 2,
        FINISHED: 3,
    }

    constructor(gameKey, gamePlayStatus) {
        this.gameKey = gameKey
        this.gamePlayStatus = gamePlayStatus
    }
}

module.exports = GamePlayInfo