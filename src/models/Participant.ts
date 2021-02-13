import GameScreen from "./GameScreen";

class Participant {
  socketId: string;
  gameScreenState: GameScreen;
  score: any | null

  constructor(socketId: string, gameScreenState: GameScreen, score: any) {
    this.socketId = socketId;
    this.gameScreenState = gameScreenState;
    this.score = score
  }

  static createCopies(copyObjList: any[]): Participant[] {
    let participants: Participant[] = []
    copyObjList.forEach(copyObj => {
      const participant = Participant.createCopy(copyObj)
      if (participant != null)
        participants.push(participant)
    })
    return participants
  }

  static createCopy(copyObj: any): Participant | null {
    if (copyObj == null || copyObj.socketId == null || copyObj.gameScreenState == null)
      return null;
    return new Participant(copyObj.socketId, copyObj.gameScreenState, copyObj.score);
  }

  static create(socketId: string): Participant {
    return new Participant(socketId, GameScreen.State.NONE, null);
  }

  setGameScreenState(gameScreenState: GameScreen) {
    this.gameScreenState = gameScreenState;
  }

  getScore(round: number, match: number): number {
    if (this.score == null)
      return -1

    const roundKey = round.toString()

    const roundLevelScore = this.score[roundKey]
    if (roundLevelScore == null)
      return -1

    const matchKey = match.toString()
    const matchScore = roundLevelScore[matchKey]

    return matchScore != null ? matchScore : -1
  }

  setScore(round: number, match: number, score: number) {
    const roundKey = round.toString()
    const matchKey = match.toString()

    if (this.score == null) {
      this.score = {}
      this.score[roundKey] = {}
      this.score[roundKey][matchKey] = score
    } else {
      if (this.score[roundKey] == null)
        this.score[roundKey] = {}

      this.score[roundKey][matchKey] = score
    }
  }

  getTotalScore(): number {

    if (this.score == null)
      return -1

    let totalScore = 0

    for (let roundKey in this.score) {
      const roundLevelScore = this.score[roundKey]
      for (let matchKey in roundLevelScore) {
        totalScore += roundLevelScore[matchKey]
      }
    }

    return totalScore
  }
}

export default Participant;
