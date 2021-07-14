import SimpleUserRecord from "./SimpleUserRecord";

class WordGuessEventResponse {
  public answer: string;
  public userRecord: SimpleUserRecord;

  private constructor(answer: string, userRecord: SimpleUserRecord) {
    this.answer = answer;
    this.userRecord = userRecord;
  }

  public static create(answer: string, userRecord: SimpleUserRecord) {
    return new WordGuessEventResponse(answer, userRecord);
  }
}

export default WordGuessEventResponse;
