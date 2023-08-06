import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Service} from '../root.service';

import {VocabPractice} from '../../entity/voacb-practice';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {Dictation, Dictations, PuzzleControls} from '../../entity/dictation';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Vocab} from '../../entity/vocab';
import {DictationUtils} from '../../utils/dictation-utils';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {ImagesObject} from "../../entity/images-object";

export interface CreateDictationHistoryRequest {
  dictationId?: number;
  histories?: VocabPracticeHistory[];
}

@Injectable({ providedIn: 'root' })
export class VocabPracticeService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private getQuestionUrl = environment.apiHost + '/vocab/get/question/';
  private generatePracticeUrl = environment.apiHost + '/vocab/practice/generate/';
  private saveHistoryUrl = environment.apiHost + '/member/vocab/practice/history/save/v2';
  private getAllHistoryUrl = environment.apiHost + '/member/vocab/practice/history/getall';
  private staticImageUrl = environment.imagesHost;

  getQuestion(word: string, showImage: boolean): Observable<VocabPractice> {
    let params = new HttpParams();
    params = params.append('image', false);

    return this.http.get<VocabPractice>(this.getQuestionUrl + encodeURIComponent(word),  {params: params});
  }

  getImages(vocabPractice: VocabPractice, verified: boolean = true): Observable<VocabPractice> {
    console.log(`picsFullPaths from server: ${vocabPractice.picsFullPaths}`);
    if (!DictationUtils.notValidImages(vocabPractice.picsFullPaths)) {
      return of(vocabPractice);
    } else {
      return this.http.get<ImagesObject>(this.imageUrl(vocabPractice.word))
        .pipe(
          map(imagesObject => {
            console.log(`imagesObject verified=${imagesObject.isVerify}`);
            vocabPractice.picsFullPaths = !verified || imagesObject.isVerify ? imagesObject.images : null;
            return vocabPractice;
          }),
          catchError(error => {
            vocabPractice.picsFullPaths = null;
            return of(vocabPractice);
          })
        );
    }
  }

  imageUrl(phrase: string): string {
    let filename = phrase.toLowerCase();
    filename = filename.replace(/[^a-zA-Z]/g, '-') + '.json';
    const folder = filename.length < 2 ? filename : filename.slice(0, 2);
    const url = `${this.staticImageUrl}%2F${folder}%2F${filename}?alt=media`;

    console.info(`'${phrase}' imageUrl = ${url}`);
    return url;
  }

  isWordEqual(word: string, input: string, includeSpace: boolean = false): boolean {
    if (!includeSpace) {
      word = word.replace(/ /g, '');
      input = input.replace(/ /g, '');
    }
    return word.replace(/-/g, '').toLowerCase() === (input.replace(/-/g, '').toLowerCase());
  }

  generatePractice(difficulty: string): Observable<Dictation> {
    return this.http.get<Dictation>(this.generatePracticeUrl + difficulty);
  }

  generatePracticeFromWords(words: string[]): Dictation {
    return <Dictation>{
      id: -1,
      showImage: true,
      vocabs: words.map(s => <Vocab>{word: s}),
      source: Dictations.Source.Generate,
    };
  }

  saveHistory(histories: VocabPracticeHistory[], dictationId?: number) {
    return this.http.post<MemberVocabulary[]>(this.saveHistoryUrl, {
      dictationId: dictationId,
      histories: this.trimHistories(histories)
    });
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

  createPuzzleControls(word: string): PuzzleControls {
    const answer = DictationUtils.splitWord(word).map(() => '?');
    const buttons = DictationUtils.toCharacterSet(word);
    const buttonCorrects = this.buttonCorrects(buttons, word.charAt(0));
    answer[0] = '_';
    return new PuzzleControls(word, answer, buttons, buttonCorrects);
  }

  receiveAnswer(controls: PuzzleControls, answer: string) {
    if (controls.isComplete()) { return; }

    controls.answers[controls.counter] = answer;
    controls.counter++;
    if (!controls.isComplete()) {
      controls.answers[controls.counter] = '_';
      controls.buttonCorrects = this.buttonCorrects(controls.buttons, controls.word.charAt(controls.counter));
    } else {
      controls.buttonCorrects.fill(false);
    }
  }

  private buttonCorrects = (buttons: string[], character: string) => buttons.map(s => s === character);
}
