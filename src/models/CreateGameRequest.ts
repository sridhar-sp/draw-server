class CreateGameRequest {
  public noOfRounds: number;
  public maxDrawingTime: number;
  public maxWordSelectionTime: number;
  public wordSelectionSource: number

  static create(noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number, wordSelectionSource: number) {
    return new CreateGameRequest(noOfRounds, maxDrawingTime, maxWordSelectionTime, wordSelectionSource);
  }

  protected constructor(noOfRounds: number, maxDrawingTime: number, maxWordSelectionTime: number, wordSelectionSource: number) {
    this.noOfRounds = noOfRounds;
    this.maxDrawingTime = maxDrawingTime;
    this.maxWordSelectionTime = maxWordSelectionTime;
    this.wordSelectionSource = wordSelectionSource
  }
}
export default CreateGameRequest;
