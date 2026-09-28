import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {Dictation} from '../../entity/dictation';
import {FFSAuthService} from '../../services/auth.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {StorageService} from '../../services/storage.service';

@Component({
    selector: 'app-dictation-view',
    templateUrl: './dictation-view.page.html',
    styleUrls: ['./dictation-view.page.scss'],
    standalone: false
})
export class DictationViewPage implements OnInit {
  dictation: Dictation;
  dictationId: number;
  showBackButton = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public dictationService: DictationService,
    public authService: FFSAuthService,
    public ionicComponentService: IonicComponentService,
    public storage: StorageService,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const state = this.router.currentNavigation()?.extras?.state;
      this.showBackButton = !!state?.showBackButton;
      if (state?.toastMessage != null) {
        this.ionicComponentService.showToastMessage(state.toastMessage);
      }
      if (state?.dictation) {
        this.dictation = JSON.parse(state.dictation);
      } else if (params.has('dictationId')) {
        this.dictation = null;
        firstValueFrom(this.dictationService.getById(Number(params.get('dictationId'))))
          .then(d => this.dictation = d)
          .catch(() => this.navigationService.openHomePage());
      }
    });
  }

  ionViewDidEnter() {}
}
