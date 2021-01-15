class GameScreen {
  static State = Object.freeze({
    NONE: 0,
    SELECT_DRAWING_WORD: 1,
    WAIT_FOR_DRAWING_WORD: 2,
    DRAW: 3,
    VIEW: 4,
    LEADER_BOARD: 5,
  });
}

export default GameScreen;
