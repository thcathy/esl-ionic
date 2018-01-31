import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {DictationPracticePage} from "../dictation-practice/dictation-practice";
import {DictationService} from "../../providers/dictation/dictation.service";

/**
 * Generated class for the DictationViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
              public dictationService: DictationService) {
    this.dictation = navParams.get('dictation');
    this.dictationId = navParams.data.dictationId;

    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DictationViewPage');
  }

  suitableAge(dictation: Dictation) {
    if (dictation.suitableMaxAge < 1 || dictation.suitableMinAge < 1)
      return "SuitableAge.Any";
    else
      return dictation.suitableMinAge + " - " + dictation.suitableMaxAge;
  }

  startDictation(dictation: Dictation) {
    this.navCtrl.setRoot(DictationPracticePage, {
      'dictation': dictation,
      'dictationId': dictation.id,
    });
  }

}
