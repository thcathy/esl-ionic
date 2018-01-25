import {Component, ElementRef, ViewChild} from '@angular/core';
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
  @ViewChild('speakRef') speakRef: ElementRef;
  dictation: Dictation;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public vocabPracticeService: VocabPracticeService
  ) {
    this.dictation = navParams.get('dictation');
    this.questionIndex = 0;
    this.phonics = "Phonetics";

    this.dictation.vocabs.forEach((vocab) => {
      vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);
        })
    })
  }

  speak() {
    this.speakRef.nativeElement.src = this.vocabPractices[this.questionIndex].activePronounceLink;
    this.speakRef.nativeElement.play();
  }

  showPhonics() {
    if (this.currentQuestion().ipaunavailable) {
      this.phonics = "N.A.";
    } else {
      this.phonics = this.currentQuestion().ipa;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DictationPracticePage');
  }

  currentQuestion() {
    return this.vocabPractices[this.questionIndex];
  }
}
