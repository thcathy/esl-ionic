import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";



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
    return this.http.get<Dictation>(this.recommendUrl + id);
  }

  createHistory(id: number, mark: number, histories: Array<VocabPracticeHistory>): Observable<Dictation> {
    return this.http.post<Dictation>(this.createHistoryUrl, {
      dictationId: id,
      mark: mark,
      histories: histories
    });
  }

  isInstantDictation(dictation: Dictation): boolean {
    return dictation.id < 0;
  }

}
