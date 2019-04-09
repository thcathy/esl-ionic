import { Component, Input } from '@angular/core';
import {MemberScoreRanking} from '../../entity/member-score-ranking';

@Component({
  selector: 'member-score-ranking',
  templateUrl: 'member-score-ranking.html',
  styleUrls: ['member-score-ranking.scss'],
})
export class MemberScoreRankingComponent {
  @Input() ranking: MemberScoreRanking;

  constructor() {
  }

}
