import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Service} from "../root.service";

import {VocabPractice} from "../../entity/voacb-practice";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/internal/Observable";
import {Dictation} from "../../entity/dictation";



@Injectable({ providedIn: 'root' })
export class VocabPracticeService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private getQuestionUrl = environment.apiHost + '/vocab/get/question/';
  private generatePracticeUrl = environment.apiHost + '/vocab/practice/generate/';

  getQuestion(word: string, showImage: boolean): Observable<VocabPractice> {
    let params = new HttpParams();
    params = params.append('image', showImage.toString());

    return this.http.get<VocabPractice>(this.getQuestionUrl + word,  {params: params});
  }

  isWordEqual(word: string, input: string): boolean {
    return word.replace(/ /g, '').replace(/-/g, '').toLowerCase() === (input.replace(/ /g, "").replace(/-/g, "").toLowerCase());
  }

  generatePractice(difficulty: string): Observable<Dictation> {
    return this.http.get<Dictation>(this.generatePracticeUrl + difficulty);
  }

}
