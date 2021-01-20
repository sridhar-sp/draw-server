class CreateGameRequest {
  public noOfRounds: number;
  public maxDrawingTime: number;
  public maxWordSelectionTime: number;

  static create(noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number) {
    return new CreateGameRequest(noOfRounds, maxDrawingTime, maxWordSelectionTime);
  }

  private constructor(noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number) {
    this.noOfRounds = noOfRounds;
    this.maxDrawingTime = maxDrawingTime;
    this.maxWordSelectionTime = maxWordSelectionTime;
  }
}
export default CreateGameRequest;
