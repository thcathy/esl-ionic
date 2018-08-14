import { Component, Input } from '@angular/core';
import {MemberScoreRanking} from "../../entity/member-score-ranking";

@Component({
  selector: 'member-score-ranking',
  templateUrl: 'member-score-ranking.html'
})
export class MemberScoreRankingComponent {
  @Input() ranking: MemberScoreRanking;

  constructor() {
  }

}
