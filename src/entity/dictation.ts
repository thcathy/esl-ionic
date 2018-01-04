import {Member} from "./member";
import {Vocab} from "./vocab";

export class Dictation {
  constructor(
    public title: string,
    public suitableMinAge: number,
    public suitableMaxAge: number,
    public rating: number,
    public totalRated: number,
    public description: string,
    public tags: string,
    public isPublicAccess: boolean,
    public totalAttempt: number,
    public password: string,
    public notAllowIPA: boolean,
    public notAllowRandomCharacters: boolean,
    public showImage: boolean,
    public lastPracticeDate: Date,
    public lastModifyDate: Date,
    public article: string,
    public creator: Member,
    public vocabs: Vocab[],
    public createdDate: Date,
    public totalRecommended: number,
    public id: number
  ) { }

  public toString() {
    return JSON.stringify(this);
  }

  public getType() {
    if (this.article == null || this.article.length < 1) {
      return "Vocab";
    } else {
      return "Article";
    }
  }
}
