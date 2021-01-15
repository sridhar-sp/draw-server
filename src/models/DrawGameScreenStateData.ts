import SimpleUserRecord from "./SimpleUserRecord";

class DrawGameScreenStateData {
  public word: string;

  static create(word: string): DrawGameScreenStateData {
    return new DrawGameScreenStateData(word);
  }

  constructor(word: string) {
    this.word = word;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default DrawGameScreenStateData;
