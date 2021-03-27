import SimpleUserRecord from "../models/SimpleUserRecord";

class ViewGameScreenStateData {
  private wordHint: string;
  private maxDrawingTimeInSeconds: number;
  private drawingParticipantUserRecord: SimpleUserRecord;

  static create(wordHint: string, maxDrawingTimeInSeconds: number, drawingParticipantUserRecord: SimpleUserRecord): ViewGameScreenStateData {
    return new ViewGameScreenStateData(wordHint, maxDrawingTimeInSeconds, drawingParticipantUserRecord);
  }

  constructor(wordHint: string, maxDrawingTimeInSeconds: number, drawingParticipantUserRecord: SimpleUserRecord) {
    this.wordHint = wordHint;
    this.maxDrawingTimeInSeconds = maxDrawingTimeInSeconds;
    this.drawingParticipantUserRecord = drawingParticipantUserRecord;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default ViewGameScreenStateData;
