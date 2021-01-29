class DismissLeaderBoardTaskRequest {
  public gameKey: string;

  static create(gameKey: string) {
    return new DismissLeaderBoardTaskRequest(gameKey);
  }

  static fromJson(json: string): DismissLeaderBoardTaskRequest {
    return JSON.parse(json) as DismissLeaderBoardTaskRequest;
  }

  constructor(gameKey: string) {
    this.gameKey = gameKey;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default DismissLeaderBoardTaskRequest;
