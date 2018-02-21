import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {AppService} from "../../providers/app.service";
import {RankingService} from "../../providers/ranking/ranking.service";
import {MemberScoreRanking} from "../../entity/member-score-ranking";
import {DictationService} from "../../providers/dictation/dictation.service";
import {DictationStatistics} from "../../entity/dictation-statistics";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {ServerService} from "../../providers/server.service";

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
              public iab: InAppBrowser,
              public serverService: ServerService,
              public alertCtrl: AlertController
  ) {
  }

  ionViewDidLoad() {
    this.serverService.healthCheck().subscribe(_data=>{},e => {
      let alert = this.alertCtrl.create({
        title: `Cannot connect to server! Please try again later (${e})`,
        buttons: [
          'Ok'
        ]
      });

      alert.present();
    });

    this.rankingService.randomTopScore().subscribe(rank => this.memberScoreRanking = rank, _e=>{});
    this.dictationService.randomDictationStatistics().subscribe(stat => this.dictationStat = stat, _e=>{});
  }

  goInstantDictation() {
    this.navCtrl.setRoot('InstantDictationPage');
  }

  goFFSdotcom() {
    const browser = this.iab.create('https://www.funfunspell.com/', '_system');
    browser.show();
  }

}
