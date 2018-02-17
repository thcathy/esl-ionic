import { Component, Input } from '@angular/core';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {NavController} from "ionic-angular";
import {NavigationService} from "../../providers/navigation.service";

@Component({
  selector: 'dictation-statistics',
  templateUrl: 'dictation-statistics.html'
})
export class DictationStatisticsComponent {
  @Input() stat: DictationStatistics;

  constructor(public navCtrl: NavController,
              public navService: NavigationService) {
  }
}
