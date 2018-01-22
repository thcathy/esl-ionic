import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {MemberScoreRanking} from "../../entity/member-score-ranking";



@Injectable()
export class RankingService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private randomTopScoreUrl = ENV.apiHost + '/ranking/random-top-score';

  randomTopScore(): Observable<MemberScoreRanking> {
    return this.http.get<MemberScoreRanking>(this.randomTopScoreUrl)
              .catch(this.handleError);
  }

}
