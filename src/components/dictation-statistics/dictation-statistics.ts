import { Component, Input } from '@angular/core';
import {DictationStatistics} from "../../entity/dictation-statistics";

@Component({
  selector: 'dictation-statistics',
  templateUrl: 'dictation-statistics.html'
})
export class DictationStatisticsComponent {
  @Input() stat: DictationStatistics;

  constructor() {
  }

}
