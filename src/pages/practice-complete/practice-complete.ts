import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {NavigationService} from "../../providers/navigation.service";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {Dictation} from "../../entity/dictation";


@IonicPage()
@Component({
  selector: 'page-practice-complete',
  templateUrl: 'practice-complete.html',
})
export class PracticeCompletePage {
  dictation: Dictation;
  mark: number;
  histories: VocabPracticeHistory[] = [];

  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NavigationService) {
    this.getNavParams();
  }

  getNavParams() {
    this.dictation = this.navParams.get('dictation');
    this.mark = this.navParams.get('mark');
    this.histories = this.navParams.get('histories');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PracticeCompletePage');
  }

}
