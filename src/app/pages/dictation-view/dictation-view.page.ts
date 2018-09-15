import { Component, OnInit } from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {AuthService} from "../../services/auth.service";
import {DictationService} from "../../services/dictation/dictation.service";
import {Storage} from "@ionic/storage";
import {IonicComponentService} from "../../services/ionic-component.service";
import {NavigationService} from "../../services/navigation.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-dictation-view',
  templateUrl: './dictation-view.page.html',
  styleUrls: ['./dictation-view.page.scss'],
})
export class DictationViewPage implements OnInit {
  dictation: Dictation;
  dictationId: number;
  showBackButton: boolean = false;

  constructor(
    public route: ActivatedRoute,
    public dictationService: DictationService,
    public authService: AuthService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.showBackButton = false;
    this.init();
  }

  async init() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.dictationId = await this.storage.get(NavigationService.storageKeys.dictationId);
    this.showBackButton = await this.storage.get(NavigationService.storageKeys.showBackButton);
    const toastMessage = await this.storage.get(NavigationService.storageKeys.toastMessage);

    if (toastMessage != null) this.ionicComponentService.showToastMessage(toastMessage);
    if (this.dictation == null && this.dictationId > 0) {
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);
    }

    if (this.dictation != null) console.log(`userId: ${this.dictation.creator.emailAddress}, userProfile: ${JSON.stringify(this.authService.userProfile)}`);
  }

}
