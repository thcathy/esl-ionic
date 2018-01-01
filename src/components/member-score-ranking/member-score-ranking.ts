import { Component, Input } from '@angular/core';
import {MemberScoreRanking} from "../../entity/member-score-ranking";

/**
 * Generated class for the MemberScoreRankingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'member-score-ranking',
  templateUrl: 'member-score-ranking.html'
})
export class MemberScoreRankingComponent {
  @Input() ranking: MemberScoreRanking;

  constructor() {

  }

}
