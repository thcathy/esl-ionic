import { Component, Input } from '@angular/core';
import {DictationStatistics} from "../../entity/dictation-statistics";
import {Dictation} from "../../entity/dictation";
import {NavController} from "ionic-angular";
import {DictationViewPage} from "../../pages/dictation-view/dictation-view";

@Component({
  selector: 'dictation-statistics',
  templateUrl: 'dictation-statistics.html'
})
export class DictationStatisticsComponent {
  @Input() stat: DictationStatistics;

  constructor(public navCtrl: NavController) {
  }

  openDictation(dictation: Dictation) {
    this.navCtrl.setRoot(DictationViewPage, {
      'dictation': dictation
    });
  }
}
