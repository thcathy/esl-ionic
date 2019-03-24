import {Component, OnInit} from '@angular/core';
import {MemberScoreRanking} from '../entity/member-score-ranking';
import {DictationStatistics} from '../entity/dictation-statistics';
import {AppService} from '../services/app.service';
import {RankingService} from '../services/ranking/ranking.service';
import {DictationService} from '../services/dictation/dictation.service';
import {ServerService} from '../services/server.service';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {NavigationService} from '../services/navigation.service';
import {AuthService} from '../services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  memberScoreRanking: MemberScoreRanking;
  dictationStat: DictationStatistics;

  constructor(public appService: AppService,
              public router: Router,
              public rankingService: RankingService,
              public dictationService: DictationService,
              public serverService: ServerService,
              public alertController: AlertController,
              public translate: TranslateService,
              public navigationService: NavigationService,
              public authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.serverService.healthCheck().subscribe(_data => {}, _e => {
      this.showConnectionErrorAlert();
    });

    this.rankingService.randomTopScore().subscribe(rank => this.memberScoreRanking = rank, _e => {});
    this.dictationService.randomDictationStatistics().subscribe(stat => {
      this.dictationStat = stat, _e => {};
    });
  }

  async showConnectionErrorAlert() {
    const alert = await this.alertController.create({
      header: `${this.translate.instant('Connection Error')}!`,
      subHeader: this.translate.instant('Please connect to network or Try again later'),
      buttons: [this.translate.instant('OK')]
    });
    alert.present();
  }
}
