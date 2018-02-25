import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
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
              public authService: AuthService,
              public toastCtrl: ToastController
  ) {
    this.dictation = navParams.get('dictation');
    this.dictationId = navParams.data.dictationId;
    this.presentToast(navParams.get('toastMessage'));

    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);
  }

  ionViewDidLoad() {
  }

  private presentToast(toastMessage: string) {
    if (toastMessage !== null) {
      let toast = this.toastCtrl.create({
        message: toastMessage,
        duration: 5000,
        position: 'top'
      });
      toast.present();
    }
  }
}
