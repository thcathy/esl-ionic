import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {MemberScoreRanking} from "../../entity/member-score-ranking";
import { ENV } from '@environment';
import {MemberScore} from "../../entity/member-score";



@Injectable()
export class RankingService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private randomTopScoreUrl = ENV.apiHost + '/ranking/random-top-score';
  private allTimesAndLast6ScoreUrl = ENV.apiHost + '/member/ranking/score/alltimes-and-last6';

  randomTopScore(): Observable<MemberScoreRanking> {
    return this.http.get<MemberScoreRanking>(this.randomTopScoreUrl)
              .catch(this.handleError);
  }

  allTimesAndLast6Score(): Observable<MemberScore[]> {
    return this.http.get<MemberScore[]>(this.allTimesAndLast6ScoreUrl);
  }
}
