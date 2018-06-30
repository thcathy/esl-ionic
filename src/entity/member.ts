import {Name} from "./name";

export class Member {
  constructor(
    public id?: number,
    public userId?: string,
    public name?: Name,
    public birthday?: Date,
    public address?: string,
    public phoneNumber?: string,
    public school?: string,
    public totalWordLearnt?: number,
    public emailAddress?: string,
    public imagePath?: string,
    public createdDate?: Date,
  ) { }

  public displayName(): string {
    if (this.name && this.name.fullName())
      return this.name.fullName();
    else
      return this.emailAddress;
  }

  public toString() {
    return JSON.stringify(this);
  }
}
