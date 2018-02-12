import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AppService} from "../../providers/app.service";
import {RankingService} from "../../providers/ranking/ranking.service";
import {MemberScoreRanking} from "../../entity/member-score-ranking";
import {DictationService} from "../../providers/dictation/dictation.service";
import {DictationStatistics} from "../../entity/dictation-statistics";
import {InAppBrowser} from "@ionic-native/in-app-browser";

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  memberScoreRanking: MemberScoreRanking;
  dictationStat: DictationStatistics;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public appService: AppService,
              public rankingService: RankingService,
              public dictationService: DictationService,
              public iab: InAppBrowser
  ) {
    this.rankingService.randomTopScore().subscribe(rank => this.memberScoreRanking = rank);
    this.dictationService.randomDictationStatistics().subscribe(stat => this.dictationStat = stat);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  goInstantDictation() {
    this.navCtrl.setRoot('InstantDictationPage');
  }

  goFFSdotcom() {
    const browser = this.iab.create('https://www.funfunspell.com/', '_system');
    browser.show();
  }

}
