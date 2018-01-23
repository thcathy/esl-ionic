import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Service} from "../root.service";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {VocabPractice} from "../../entity/voacb-practice";



@Injectable()
export class VocabPracticeService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private getQuestionUrl = ENV.apiHost + '/vocab/get/question/';

  getQuestion(word: string, showImage: boolean): Observable<VocabPractice> {
    let params = new HttpParams();
    params = params.append('image', showImage.toString());

    return this.http.get<VocabPractice>(this.getQuestionUrl + word,  {params: params})
      .catch(this.handleError);
  }

}
