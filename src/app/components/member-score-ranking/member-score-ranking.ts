import { Component, Input } from '@angular/core';
import {MemberScoreRanking} from "../../entity/member-score-ranking";
import {DisplayService} from "../../services/display.service";
import {Member} from "../../entity/member";

@Component({
  selector: 'member-score-ranking',
  templateUrl: 'member-score-ranking.html',
  styleUrls: ['member-score-ranking.scss'],
})
export class MemberScoreRankingComponent {
  @Input() ranking: MemberScoreRanking;

  constructor(private displayService: DisplayService) {
  }

  displayName(member: Member) {
    const displayName = this.displayService.displayName(member);
    if (displayName.length <= 17) {
      return displayName;
    } else {
      return displayName.substring(0, 17) + '...';
    }
  }

}
