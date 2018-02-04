import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";



@Injectable()
export class DictationService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private randomStatUrl = ENV.apiHost + '/dictation/random-stat';
  private getByIdUrl = ENV.apiHost + '/dictation/get/';
  private recommendUrl = ENV.apiHost + '/dictation/recommend/';

  randomDictationStatistics(): Observable<DictationStatistics> {
    return this.http.get<DictationStatistics>(this.randomStatUrl)
              .catch(this.handleError);
  }

  getById(id: number): Observable<Dictation> {
    return this.http.get<Dictation>(this.getByIdUrl + id)
              .catch(this.handleError);
  }

  recommend(id: number): Observable<Dictation> {
    return this.http.get<Dictation>(this.recommendUrl + id)
      .catch(this.handleError);
  }

}
