import {MemberScore} from "./member-score";

export class MemberScoreRanking {
  constructor(
    public base: MemberScore,
    public isTop: boolean,
    public firstPosition: number,
    public scores: MemberScore[]
  ) { }

  public toString() {
    return JSON.stringify(this);
  }
}
