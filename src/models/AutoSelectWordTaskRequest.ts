class AutoSelectWordTaskRequest {
  public gameKey: string;
  public socketId: string;
  public word: string;

  static create(gameKey: string, socketId: string, word: string): AutoSelectWordTaskRequest {
    return new AutoSelectWordTaskRequest(gameKey, socketId, word);
  }

  static fromJson(json: string): AutoSelectWordTaskRequest {
    return JSON.parse(json) as AutoSelectWordTaskRequest;
  }

  constructor(gameKey: string, socketId: string, word: string) {
    this.gameKey = gameKey;
    this.socketId = socketId;
    this.word = word;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default AutoSelectWordTaskRequest;
