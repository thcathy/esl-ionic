import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";

import {MemberScoreRanking} from "../../entity/member-score-ranking";
import {MemberScore} from "../../entity/member-score";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class RankingService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private randomTopScoreUrl = environment.apiHost + '/ranking/random-top-score';
  private allTimesAndLast6ScoreUrl = environment.apiHost + '/member/ranking/score/alltimes-and-last6';

  randomTopScore(): Observable<MemberScoreRanking> {
    return this.http.get<MemberScoreRanking>(this.randomTopScoreUrl);
  }

  allTimesAndLast6Score(): Observable<MemberScore[]> {
    return this.http.get<MemberScore[]>(this.allTimesAndLast6ScoreUrl);
  }
}
