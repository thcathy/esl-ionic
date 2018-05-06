import { Component, Input } from '@angular/core';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";
import {NavController} from "ionic-angular";
import {DictationViewPage} from "../../pages/dictation-view/dictation-view";
import {NavigationService} from "../../providers/navigation.service";
import {DisplayService} from "../../providers/display.service";

@Component({
  selector: 'dictation-statistics',
  templateUrl: 'dictation-statistics.html'
})
export class DictationStatisticsComponent {
  @Input() stat: DictationStatistics;

  constructor(
    public navCtrl: NavController,
    public navService: NavigationService,
    public displayService: DisplayService) {
  }

  openDictation(dictation: Dictation) {
    this.navCtrl.setRoot(DictationViewPage, {
      'dictation': dictation,
      'dictationId': dictation.id
    });
  }
}
