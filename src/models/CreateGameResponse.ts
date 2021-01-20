class CreateGameResponse {
  public gameKey: string;

  static create(gameKey: string): CreateGameResponse {
    return new CreateGameResponse(gameKey);
  }

  constructor(gameKey: string) {
    this.gameKey = gameKey;
  }
}

export default CreateGameResponse;
