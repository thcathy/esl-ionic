import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AppService} from "../../providers/app.service";
import {RankingService} from "../../providers/ranking/ranking.service";
import {MemberScoreRanking} from "../../entity/member-score-ranking";

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
  public memberScoreRanking: MemberScoreRanking;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public appService: AppService,
              public rankingService: RankingService
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.rankingService.randomTopScore().subscribe(rank => this.memberScoreRanking = rank);
  }

}
