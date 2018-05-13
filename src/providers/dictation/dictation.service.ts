import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import { ENV } from '@environment';
import {ValidationUtils} from "../../utils/validation-utils";

@Injectable()
export class DictationService {

  constructor (private http: HttpClient) {
  }

  private randomStatUrl = ENV.apiHost + '/dictation/random-stat';
  private getByIdUrl = ENV.apiHost + '/dictation/get/';
  private recommendUrl = ENV.apiHost + '/dictation/recommend/';
  private createHistoryUrl = ENV.apiHost + '/dictation/history/create';

  randomDictationStatistics(): Observable<DictationStatistics> {
    return this.http.get<DictationStatistics>(this.randomStatUrl);
  }

  getById(id: number): Observable<Dictation> {
    return this.http.get<Dictation>(this.getByIdUrl + id);
  }

  recommend(id: number): Observable<Dictation> {
    console.log(`recommend dictation ${id} by url ${this.recommendUrl}`);
    return this.http.get<Dictation>(this.recommendUrl + id);
  }

  createHistory(id: number, mark: number, histories: Array<VocabPracticeHistory>): Observable<Dictation> {
    let trimmedSizeHistories = histories.map((h) => {
      h.question.picsFullPaths = [];
      h.question.picsFullPathsInString = '';
      h.question.grades = [];
      return h;
    });

    return this.http.post<Dictation>(this.createHistoryUrl, {
      dictationId: id,
      mark: mark,
      histories: trimmedSizeHistories
    });
  }

  isInstantDictation(dictation: Dictation): boolean {
    return dictation.id < 0;
  }

  isSentenceDictation(dictation: Dictation): boolean {
    return !ValidationUtils.isBlankString(dictation.article);
  }
}
