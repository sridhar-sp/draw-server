import GameScreen from "./GameScreen";

class Participant {
  socketId: string;
  gameScreenState: GameScreen;

  constructor(socketId: string, gameScreenState: GameScreen) {
    this.socketId = socketId;
    this.gameScreenState = gameScreenState;
  }

  static create(socketId: string) {
    return new Participant(socketId, GameScreen.State.NONE);
  }

  setGameScreenState(gameScreenState: GameScreen) {
    this.gameScreenState = gameScreenState;
  }
}

export default Participant;
