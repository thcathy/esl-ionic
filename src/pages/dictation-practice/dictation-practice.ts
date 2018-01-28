import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {VocabPracticeService} from "../../providers/practice/vocab-practice.service";
import {VocabPractice} from "../../entity/voacb-practice";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";

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
  mark: number;
  histories: VocabPracticeHistory[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public vocabPracticeService: VocabPracticeService
  ) {
    this.dictation = navParams.get('dictation');
    this.init();

    this.dictation.vocabs.forEach((vocab) => {
      vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);
        })
    })
  }

  private init() {
    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = "Phonetics";
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

  submitAnswer() {
    this.checkAnswer();
    this.preNextQuestion();
  }

  private checkAnswer() {
    let correct = this.vocabPracticeService.isWordEqual(this.currentQuestion().word, this.answer == null ? '' : this.answer);
    if (correct) this.mark++;

    let history = <VocabPracticeHistory>  {
      answer: this.answer,
      question: this.currentQuestion(),
      correct: correct,
      state: ''
    }
    this.histories.unshift(history);
    history.state = 'in';
  }

  private preNextQuestion() {
    this.phonics = "Phonetics";
    this.questionIndex++;
    this.answer = '';
  }

}
