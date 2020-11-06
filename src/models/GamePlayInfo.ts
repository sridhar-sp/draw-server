const logger = require('../logger/logger.js')
import Participant from './Participant'
import GamePlayStatus from './GamePlayStatus'

class GamePlayInfo {

    static createCopy(copyObj: GamePlayInfo) {
        return new GamePlayInfo(copyObj.gameKey, copyObj.gamePlayStatus, copyObj.noOfRounds, copyObj.currentRound,
            copyObj.participants)
    }

    static create(gameKey: string) {
        return new GamePlayInfo(gameKey, GamePlayStatus.NOT_STARTED, 1, 0, [])
    }
    gameKey: string
    gamePlayStatus: GamePlayStatus
    noOfRounds: number
    currentRound: number
    participants: Participant[]

    constructor(gameKey: string, gamePlayStatus: GamePlayStatus, noOfRounds: number, currentRound: number,
        participants: Participant[]) {
        this.gameKey = gameKey
        this.gamePlayStatus = gamePlayStatus
        this.noOfRounds = noOfRounds
        this.currentRound = currentRound
        this.participants = participants == null ? [] : participants
    }

    updateGamePlayStatus(gamePlayStatus: GamePlayStatus) {
        this.gamePlayStatus = gamePlayStatus
    }

    addParticipant(participant: Participant) {
        const index = this.findParticipant(participant.socketId)

        if (index != -1) {
            logger.warn(`Participant record already available at index ${index}`)
            return this.participants[index]
        }

        this.participants.push(participant)
        logger.log(`Added participant ${participant.socketId}`)

        return participant
    }

    removeParticipant(socketId: string) {
        const index = this.findParticipant(socketId)

        if (index == -1) {
            logger.log(`No user record found for ${socketId}`)
            return null
        }

        const paricipant = this.participants[index]

        this.participants.splice(index, 1)

        return paricipant
    }

    findParticipant(socketId: string) {
        if (!this.participants || this.participants.length == 0)
            return -1
        return this.participants.findIndex(participant => participant.socketId == socketId)
    }
}

export default GamePlayInfo