import {Component, Input} from '@angular/core';
import {MemberScore} from "../../entity/member-score";

@Component({
  selector: 'member-score-list',
  templateUrl: 'member-score-list.html'
})
export class MemberScoreListComponent {
  @Input() allTimesScore: MemberScore;
  @Input() scores: MemberScore[];


  constructor() {}

}
