import {Member} from "./member";

export class MemberScore {
  constructor(
    public id: number,
    public createdDate: Date,
    public lastUpdateDate: Date,
    public member: Member,
    public scoreYearMonth: string,
    public score: number
  ) { }

  public toString() {
    return JSON.stringify(this);
  }
}
