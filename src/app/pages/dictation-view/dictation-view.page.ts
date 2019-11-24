import {Component, OnInit} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {AuthService} from '../../services/auth.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {Storage} from '@ionic/storage';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';

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
    public dictationService: DictationService,
    public authService: AuthService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    console.log(`called`);
    this.route.paramMap.subscribe(
      params => {
        if (params.has('dictationId')) {
          this.storage.set(NavigationService.storageKeys.dictation, null);
          this.dictation = null;
          console.log(`params.get('dictationId') ${params.get('dictationId')}`);
          this.dictationService.getById(Number(params.get('dictationId'))).subscribe(d => this.dictation = d);
        }
      }
    );
  }

  ionViewDidEnter() {
    this.showBackButton = false;
    this.init();
  }

  async init() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.showBackButton = await this.storage.get(NavigationService.storageKeys.showBackButton);
    const toastMessage = await this.storage.get(NavigationService.storageKeys.toastMessage);

    if (toastMessage != null) { this.ionicComponentService.showToastMessage(toastMessage); }
  }
}
