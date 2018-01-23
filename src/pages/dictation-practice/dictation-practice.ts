import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {VocabPracticeService} from "../../providers/practice/vocab-practice.service";
import {VocabPractice} from "../../entity/voacb-practice";

/**
 * Generated class for the DictaionPracticePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dictation-practice',
  templateUrl: 'dictation-practice.html',
})
export class DictationPracticePage {
  dictation: Dictation;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public vocabPracticeService: VocabPracticeService
  ) {
    this.dictation = navParams.get('dictation');
    this.questionIndex = 0;

    this.dictation.vocabs.forEach((vocab) => {
      vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);
        })
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DictationPracticePage');
  }

}
