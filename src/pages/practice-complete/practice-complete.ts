import {Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {NavigationService} from "../../providers/navigation.service";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {Dictation} from "../../entity/dictation";
import {DictationService} from "../../providers/dictation/dictation.service";

@IonicPage()
@Component({
  selector: 'page-practice-complete',
  templateUrl: 'practice-complete.html',
})
export class PracticeCompletePage {
  @ViewChild('dictationCard') dictationCard;

  dictation: Dictation;
  mark: number;
  histories: VocabPracticeHistory[] = [];
  recommended: boolean;

  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NavigationService,
        public dictationService: DictationService) {
    this.getNavParams();
  }

  getNavParams() {
    this.dictation = this.navParams.get('dictation');
    this.mark = this.navParams.get('mark');
    this.histories = this.navParams.get('histories');
  }

  recommend() {
    this.dictationService.recommend(this.dictation.id).subscribe(d => {
      this.dictation = d;
      this.recommended = true;
      this.dictationCard.highlightRecommend();
    })
  }

}
