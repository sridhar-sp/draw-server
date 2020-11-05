const logger = require('../logger/logger.js')
class GamePlayInfo {
    static GamePlayStatus = Object.freeze(
        {
            NOT_STARTED: 1,
            STARTED: 2,
            FINISHED: 3,
        }
    )

    static createCopy(copyObj) {
        return new GamePlayInfo(copyObj.gameKey, copyObj.gamePlayStatus, copyObj.noOfRounds, copyObj.currentRound,
            copyObj.participants)
    }

    static create(gameKey) {
        return new GamePlayInfo(gameKey, GamePlayInfo.GamePlayStatus.NOT_STARTED, 1, 0, [])
    }

    constructor(gameKey, gamePlayStatus, noOfRounds, currentRound, participants) {
        this.gameKey = gameKey
        this.gamePlayStatus = gamePlayStatus
        this.noOfRounds = noOfRounds
        this.currentRound = currentRound
        this.participants = participants == null ? [] : participants
    }

    updateGamePlayStatus(gamePlayStatus) {
        this.gamePlayStatus = gamePlayStatus
    }

    addParticipant(participant) {
        const index = this.findParticipant(participant.socketId)

        if (index != -1) {
            logger.warn(`Participant record already available at index ${index}`)
            return this.participants[index]
        }

        this.participants.push(participant)
        logger.log(`Added participant ${participant.socketId}`)

        return participant
    }

    removeParticipant(socketId) {
        const index = this.findParticipant(socketId)

        if (index == -1) {
            logger.log(`No user record found for ${socketId}`)
            return null
        }

        const paricipant = this.participants[index]

        this.participants.splice(index, 1)

        return paricipant
    }

    findParticipant(socketId) {
        if (!this.participants || this.participants.length == 0)
            return -1
        return this.participants.findIndex(participant => participant.socketId == socketId)
    }
}

module.exports = GamePlayInfo