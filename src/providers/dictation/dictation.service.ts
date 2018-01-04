import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DictationStatistics} from "../../entity/dictation-statistics";



@Injectable()
export class DictationService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private randomStatUrl = ENV.apiHost + '/dictation/random-stat';

  randomDictationStatistics(): Observable<DictationStatistics> {
    return this.http.get(this.randomStatUrl)
      .map(res => <DictationStatistics> res)
              .catch(this.handleError);
  }

}
