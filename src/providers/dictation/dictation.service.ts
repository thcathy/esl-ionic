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
import {SentenceHistory} from "../../entity/sentence-history";

export interface SearchDictationRequest {
  keyword?: string;
  searchTitle?: boolean;
  searchDescription?: boolean;
  minDate?: Date;
  maxDate?: Date;
  creator?: string;
  suitableStudent?: string;
}

export interface CreateDictationHistoryRequest {
  dictationId?: number;
  mark?: number;
  correct?: number;
  wrong?: number;
  histories?: VocabPracticeHistory[];
  historyJSON?: string;
}

@Injectable()
export class DictationService {

  constructor (private http: HttpClient) {
  }

  private randomStatUrl = ENV.apiHost + '/dictation/random-stat';
  private getByIdUrl = ENV.apiHost + '/dictation/get/';
  private recommendUrl = ENV.apiHost + '/dictation/recommend/';
  private createHistoryUrl = ENV.apiHost + '/dictation/history/create';
  private searchDictationUrl = ENV.apiHost + '/dictation/search';

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
    let sizeTrimmedHistories = histories.map((h) => {
      h.question.picsFullPaths = [];
      h.question.picsFullPathsInString = '';
      h.question.grades = [];
      return h;
    });

    return this.http.post<Dictation>(this.createHistoryUrl, {
      dictationId: id,
      mark: mark,
      histories: sizeTrimmedHistories
    });
  }

  createHistory(request: CreateDictationHistoryRequest): Observable<Dictation> {
    return this.http.post<Dictation>(this.createHistoryUrl, request);
  }

  createSentenceDictationHistory(dictation: Dictation, correct: number, wrong: number, histories: SentenceHistory[]): Observable<Dictation> {
    return this.createHistory({
      dictationId: dictation.id,
      mark: correct / 10,
      correct: correct,
      wrong:wrong,
      historyJSON: JSON.stringify({
        dictation: dictation,
        correct: correct,
        wrong: wrong,
        histories: histories
      })
    });
  }

  createVocabDictationHistory(dictation: Dictation, mark: number, histories: Array<VocabPracticeHistory>): Observable<Dictation>  {
    let sizeTrimmedHistories = histories.map((h) => {
      h.question.picsFullPaths = [];
      h.question.picsFullPathsInString = '';
      h.question.grades = [];
      return h;
    });

    return this.createHistory({
      dictationId: dictation.id,
      mark: mark,
      correct: mark,
      wrong: histories.length - mark,
      histories: sizeTrimmedHistories,
      historyJSON: JSON.stringify({
        dictation: dictation,
        mark: mark,
        histories: sizeTrimmedHistories
      })
    });
  }

  isInstantDictation(dictation: Dictation): boolean {
    return dictation.id < 0;
  }

  isSentenceDictation(dictation: Dictation): boolean {
    return !ValidationUtils.isBlankString(dictation.article);
  }

  search(request: SearchDictationRequest): Observable<Dictation[]> {
    return this.http.post<Dictation[]>(this.searchDictationUrl, request);
  }
}
