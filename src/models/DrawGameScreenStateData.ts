class DrawGameScreenStateData {
  public word: string;

  static create(word: string) {
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
