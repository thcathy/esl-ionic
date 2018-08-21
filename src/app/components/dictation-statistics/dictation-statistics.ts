import { Component, Input } from '@angular/core';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../services/navigation.service";
import {DisplayService} from "../../services/display.service";
import {Router} from "@angular/router";

@Component({
  selector: 'dictation-statistics',
  templateUrl: 'dictation-statistics.html',
  styleUrls: ['dictation-statistics.scss'],
})
export class DictationStatisticsComponent {
  @Input() stat: DictationStatistics;

  constructor(
    public router: Router,
    public navService: NavigationService,
    public displayService: DisplayService,
    ) {
  }

  openDictation(dictation: Dictation) {
    this.navService.pushOpenDictation(dictation);
  }
}
