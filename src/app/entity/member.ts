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

}
