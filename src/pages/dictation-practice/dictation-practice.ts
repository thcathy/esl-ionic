import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {VocabPracticeService} from "../../providers/practice/vocab-practice.service";
import {VocabPractice} from "../../entity/voacb-practice";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {DictationService} from "../../providers/dictation/dictation.service";

@IonicPage({
  segment: 'dictation-practice/:dictationId', // will be used in browser as URL
})
@Component({
  selector: 'page-dictation-practice',
  templateUrl: 'dictation-practice.html',
})
export class DictationPracticePage {
  @ViewChild('speakRef') speakRef: ElementRef;
  dictation: Dictation;
  dictationId: number;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;
  mark: number;
  histories: VocabPracticeHistory[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService
  ) {
    this.dictation = navParams.get('dictation');
    this.dictationId = navParams.data.dictationId;
    this.init();

    this.dictation.vocabs.forEach((vocab) => {
      vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);
        })
    });
  }

  ionViewDidLoad() {
    if (this.vocabPractices.length == 1)
      this.speak();
  }

  private init() {
    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);

    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = "Phonetics";
  }

  speak() {
    if (this.vocabPractices[this.questionIndex].activePronounceLink) {
      this.speakRef.nativeElement.src = this.vocabPractices[this.questionIndex].activePronounceLink;
      this.speakRef.nativeElement.play();
    } else {
      responsiveVoice.speak(this.vocabPractices[this.questionIndex].word);
    }
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
    this.speak();
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
