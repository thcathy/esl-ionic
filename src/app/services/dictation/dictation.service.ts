import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {DictationStatistics} from '../../entity/dictation-statistics';
import {Dictation} from '../../entity/dictation';
import {ValidationUtils} from '../../utils/validation-utils';
import {SentenceHistory} from '../../entity/sentence-history';
import {environment} from '../../../environments/environment';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {Observable} from 'rxjs/internal/Observable';
import {VocabPracticeService} from '../practice/vocab-practice.service';

export interface SearchDictationRequest {
  keyword?: string;
  searchTitle?: boolean;
  searchDescription?: boolean;
  minDate?: Date;
  maxDate?: Date;
  creator?: string;
  suitableStudent?: string;
  type?: string;
}

export interface CreateDictationHistoryRequest {
  dictationId?: number;
  mark?: number;
  correct?: number;
  wrong?: number;
  histories?: VocabPracticeHistory[];
  historyJSON?: string;
}

@Injectable({ providedIn: 'root' })
export class DictationService {

  constructor (
    private http: HttpClient,
    private vocabPracticeService: VocabPracticeService,
  ) {
  }

  private randomStatUrl = environment.apiHost + '/dictation/random-stat';
  private getByIdUrl = environment.apiHost + '/dictation/get/';
  private recommendUrl = environment.apiHost + '/dictation/recommend/';
  private createHistoryUrl = environment.apiHost + '/dictation/history/create';
  private searchDictationUrl = environment.apiHost + '/dictation/search';

  randomDictationStatistics(): Observable<DictationStatistics> {
    return this.http.get<DictationStatistics>(this.randomStatUrl);
  }

  getById(id: number): Observable<Dictation> {
    return this.http.get<Dictation>(this.getByIdUrl + id);
  }

  recommend(id: number): Observable<Dictation> {
    return this.http.get<Dictation>(this.recommendUrl + id);
  }

  createHistory(request: CreateDictationHistoryRequest): Observable<Dictation> {
    return this.http.post<Dictation>(this.createHistoryUrl, request);
  }

  createSentenceDictationHistory(dictation: Dictation, correct: number, wrong: number, histories: SentenceHistory[]): Observable<Dictation> {
    return this.createHistory({
      dictationId: dictation.id,
      mark: correct / 10,
      correct: correct,
      wrong: wrong,
      historyJSON: JSON.stringify({
        dictation: dictation,
        correct: correct,
        wrong: wrong,
        histories: histories
      })
    });
  }

  createVocabDictationHistory(dictation: Dictation, mark: number, histories: Array<VocabPracticeHistory>): Observable<Dictation>  {
    const sizeTrimmedHistories = this.vocabPracticeService.trimHistories(histories);

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

  isGeneratedDictation(dictation: Dictation): boolean {
    return dictation != null && dictation.generated;
  }

  search(request: SearchDictationRequest): Observable<Dictation[]> {
    return this.http.post<Dictation[]>(this.searchDictationUrl, request);
  }
}
