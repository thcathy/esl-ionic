import {Component, OnInit} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {AuthService} from '../../services/auth.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {Storage} from '@ionic/storage';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-dictation-view',
  templateUrl: './dictation-view.page.html',
  styleUrls: ['./dictation-view.page.scss'],
})
export class DictationViewPage implements OnInit {
  dictation: Dictation;
  dictationId: number;
  showBackButton = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public dictationService: DictationService,
    public authService: AuthService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.showBackButton = false;
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        const state = this.router.getCurrentNavigation().extras.state;
        this.dictation = JSON.parse(state.dictation);
        this.showBackButton = state.showBackButton;
        const toastMessage = state.toastMessage;
        if (toastMessage != null) { this.ionicComponentService.showToastMessage(toastMessage); }
      } else if (params.has('dictationId')) {
        console.log(`params.get('dictationId') ${params.get('dictationId')}`);
        this.dictationService.getById(Number(params.get('dictationId'))).toPromise()
          .then(d => this.dictation = d)
          .catch(e => this.navigationService.openHomePage());
      }
    });
  }

  ionViewDidEnter() {}
}
