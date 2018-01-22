import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {DictationPracticePage} from "../dictation-practice/dictation-practice";

/**
 * Generated class for the DictationViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dictation-view',
  templateUrl: 'dictation-view.html',
})
export class DictationViewPage {
  dictation: Dictation;

  constructor(public navCtrl: NavController,
              public navParams: NavParams) {
    this.dictation = navParams.get('dictation');
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
      'dictation': dictation
    });
  }

}
