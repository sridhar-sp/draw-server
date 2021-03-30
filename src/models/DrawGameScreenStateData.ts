import SimpleUserRecord from "./SimpleUserRecord";

class DrawGameScreenStateData {
  private word: string;
  private maxDrawingTimeInSeconds: number

  static create(word: string, maxDrawingTimeInSeconds: number): DrawGameScreenStateData {
    return new DrawGameScreenStateData(word, maxDrawingTimeInSeconds);
  }

  constructor(word: string, maxDrawingTimeInSeconds: number) {
    this.word = word;
    this.maxDrawingTimeInSeconds = maxDrawingTimeInSeconds
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default DrawGameScreenStateData;
