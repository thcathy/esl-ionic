import {Member} from "./member";

export class MemberScore {
  constructor(
    public id: number,
    public createdDate: Date,
    public lastUpdateDate: Date,
    public yearMonthAsDate: Date,
    public member: Member,
    public scoreYearMonth: number,
    public score: number
  ) { }

  public toString() {
    return JSON.stringify(this);
  }
}
