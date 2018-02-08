
export class Vocab {
  constructor(
    public id?: number,
    public word?: string,
    public totalCorrect?: number,
    public totalWrong?: number,
    public createdDate?: Date
  ) { }

  public toString() {
    return JSON.stringify(this);
  }

  public correctPercent() {
    if (this.totalCorrect + this.totalWrong == 0)
      return 0;
    else
      return this.totalCorrect * 100 / (this.totalCorrect + this.totalWrong);
  }

  public wrongPercent() {
    if (this.totalCorrect + this.totalWrong == 0)
      return 0;
    else
      return this.totalWrong * 100 / (this.totalCorrect + this.totalWrong);
  }
}
