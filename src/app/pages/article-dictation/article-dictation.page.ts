import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {ArticleDictationService} from "../../services/dictation/article-dictation.service";
import {SpeechService} from "../../services/speech.service";

@Component({
  selector: 'app-article-dictation',
  templateUrl: './article-dictation.page.html',
  styleUrls: ['./article-dictation.page.scss'],
})
export class ArticleDictationPage implements OnInit {
  dictation: Dictation;
  sentences: string[];
  speakingRate: number = 0.7;
  currentSentence: number = 0;
  mark: number = 0;
  answer: string = "";
  histories: SentenceHistory[] = [];
  @ViewChild('answerElement') answerInput;


  constructor(
    public articleDictationService: ArticleDictationService,
    public speechService: SpeechService,
  ) { }

  ngOnInit() {
    this.dictation = navParams.get('dictation');
    this.sentences = this.articleDictationService.divideToSentences(this.dictation.article);
    console.log(`divided into ${this.sentences.length} sentences`);
    this.speak();
  }

  slower() {
    this.speakingRate = this.speakingRate - 0.1;
    if (this.speakingRate < 0.01) this.speakingRate = 0.1;
  }

  faster() {
    this.speakingRate = this.speakingRate + 0.1;
    if (this.speakingRate > 0.99) this.speakingRate = 1.0;
  }

  speak() {
    this.speechService.speak(this.sentences[this.currentSentence], this.speakingRate);
    this.focusAnswer();
  }

  submitAnswer() {
    this.histories.unshift(
      this.articleDictationService.checkAnswer(this.sentences[this.currentSentence], this.answer)
    );

    this.currentSentence++;
    this.answer = "";

    if (this.currentSentence >= this.sentences.length) {
      this.navCtrl.setRoot(ArticleDictationCompletePage, {
        'dictation': this.dictation,
        'histories': this.histories.reverse()
      });
    } else {
      this.speak();
    }
  }

  focusAnswer() {
    if (this.answerInput) this.answerInput.setFocus();
  }

}
