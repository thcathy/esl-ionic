import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Service} from '../root.service';

import {VocabPractice} from '../../entity/voacb-practice';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {Dictation} from '../../entity/dictation';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Vocab} from '../../entity/vocab';



@Injectable({ providedIn: 'root' })
export class VocabPracticeService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private getQuestionUrl = environment.apiHost + '/vocab/get/question/';
  private generatePracticeUrl = environment.apiHost + '/vocab/practice/generate/';
  private saveHistoryUrl = environment.apiHost + '/member/vocab/practice/history/save';
  private getAllHistoryUrl = environment.apiHost + '/member/vocab/practice/history/getall';

  getQuestion(word: string, showImage: boolean): Observable<VocabPractice> {
    let params = new HttpParams();
    params = params.append('image', showImage.toString());

    return this.http.get<VocabPractice>(this.getQuestionUrl + word,  {params: params});
  }

  isWordEqual(word: string, input: string): boolean {
    return word.replace(/ /g, '').replace(/-/g, '').toLowerCase() === (input.replace(/ /g, '').replace(/-/g, '').toLowerCase());
  }

  generatePractice(difficulty: string): Observable<Dictation> {
    return this.http.get<Dictation>(this.generatePracticeUrl + difficulty);
  }

  generatePracticeFromWords(words: string[]): Dictation {
    return <Dictation>{
      id: -1,
      showImage: true,
      vocabs: words.map(s => <Vocab>{word: s}),
      generated: true,
    };
  }

  saveHistory(histories: VocabPracticeHistory[]) {
    return this.http.post<MemberVocabulary[]>(this.saveHistoryUrl, this.trimHistories(histories));
  }

  getAllHistory() {
    return this.http.get<MemberVocabulary[]>(this.getAllHistoryUrl);
  }

  trimHistories(histories: VocabPracticeHistory[]) {
    return histories.map((h) => {
      const trimmedQuestion = Object.assign({}, h.question);
      trimmedQuestion.picsFullPaths = [];
      trimmedQuestion.picsFullPathsInString = '';
      trimmedQuestion.grades = [];
      h.question = trimmedQuestion;
      return h;
    });
  }

}
