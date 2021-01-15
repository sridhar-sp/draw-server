import SimpleUserRecord from "../models/SimpleUserRecord";

class ViewGameScreenStateData {
  public wordHint: string;
  public drawingParticipantUserRecord: SimpleUserRecord;

  static create(wordHint: string, drawingParticipantUserRecord: SimpleUserRecord): ViewGameScreenStateData {
    return new ViewGameScreenStateData(wordHint, drawingParticipantUserRecord);
  }

  constructor(wordHint: string, drawingParticipantUserRecord: SimpleUserRecord) {
    this.wordHint = wordHint;
    this.drawingParticipantUserRecord = drawingParticipantUserRecord;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default ViewGameScreenStateData;
