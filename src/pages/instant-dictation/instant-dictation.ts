import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-instant-dictation',
  templateUrl: 'instant-dictation.html',
})
export class InstantDictationPage {
  maxVocab: number = 20;
  vocabs: Array<string> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    for (var i = 0; i < this.maxVocab; i++) {
      this.vocabs.push('')
    }
  }

  ionViewDidLoad() {
  }

}
