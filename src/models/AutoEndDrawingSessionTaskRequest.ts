class AutoEndDrawingSessionTaskRequest {
  private gameKey: string;

  static create(gameKey: string) {
    return new AutoEndDrawingSessionTaskRequest(gameKey);
  }

  static fromJson(json: string): AutoEndDrawingSessionTaskRequest {
    return JSON.parse(json) as AutoEndDrawingSessionTaskRequest;
  }

  constructor(gameKey: string) {
    this.gameKey = gameKey;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default AutoEndDrawingSessionTaskRequest;
