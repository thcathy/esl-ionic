import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {DictationService} from "../../providers/dictation/dictation.service";
import {AuthService} from "../../providers/auth.service";

@IonicPage({
  segment: 'dictation-view/:dictationId', // will be used in browser as URL
})
@Component({
  selector: 'page-dictation-view',
  templateUrl: 'dictation-view.html',
})
export class DictationViewPage {
  dictation: Dictation;
  dictationId: number;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public dictationService: DictationService,
              public authService: AuthService
  ) {
    this.dictation = navParams.get('dictation');
    this.dictationId = navParams.data.dictationId;

    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DictationViewPage');
  }

}
