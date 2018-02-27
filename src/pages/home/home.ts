import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {AppService} from "../../providers/app.service";
import {RankingService} from "../../providers/ranking/ranking.service";
import {MemberScoreRanking} from "../../entity/member-score-ranking";
import {DictationService} from "../../providers/dictation/dictation.service";
import {DictationStatistics} from "../../entity/dictation-statistics";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {ServerService} from "../../providers/server.service";
import {TranslateService} from "@ngx-translate/core";

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
              public alertCtrl: AlertController,
              public translate: TranslateService,
  ) {
  }

  ionViewDidLoad() {
    this.serverService.healthCheck().subscribe(_data=>{},_e => {
      let alert = this.alertCtrl.create({
        title: `${this.translate.instant('Connection Error')}!`,
        subTitle: this.translate.instant('Please connect to network or Try again later'),
        buttons: [this.translate.instant('OK')]
      });

      alert.present();
    });

    this.rankingService.randomTopScore().subscribe(rank => this.memberScoreRanking = rank, _e=>{});
    this.dictationService.randomDictationStatistics().subscribe(stat => this.dictationStat = stat, _e=>{});
  }

  openInstantDictation() {
    this.navCtrl.setRoot('InstantDictationPage');
  }

  goFFSdotcom() {
    const browser = this.iab.create('https://www.funfunspell.com/', '_system');
    browser.show();
  }

  openCreateDictationPage() {
    this.navCtrl.setRoot('EditDictationPage');
  }

}
