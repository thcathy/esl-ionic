import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {SentenceHistory} from '../../entity/sentence-history';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {SpeechService} from '../../services/speech.service';
import {NavigationService} from '../../services/navigation.service';
import {Storage} from '@ionic/storage';
import {NGXLogger} from 'ngx-logger';
import {UIOptionsService} from '../../services/ui-options.service';

@Component({
  selector: 'app-article-dictation',
  templateUrl: './article-dictation.page.html',
  styleUrls: ['./article-dictation.page.scss'],
})
export class ArticleDictationPage implements OnInit {
  dictation: Dictation;
  sentences: string[];
  speakingRate = 0.7;
  currentSentence = 0;
  mark = 0;
  answer = '';
  histories: SentenceHistory[] = [];
  showKeyboard = true;
  @ViewChild('answerElement', { static: true }) answerInput;

  constructor(
    public articleDictationService: ArticleDictationService,
    public speechService: SpeechService,
    public storage: Storage,
    public navigationService: NavigationService,
    public uiOptionsService: UIOptionsService,
    private log: NGXLogger,
  ) {}

  ngOnInit() {
    this.uiOptionsService.loadOption(UIOptionsService.keys.disableKeyboard)
      .then(v => this.showKeyboard = !v);
  }

  clearVariables() {
    this.currentSentence = 0;
    this.mark = 0;
    this.answer = '';
    this.sentences = [];
    this.histories = [];
    this.dictation = null;
  }

  ionViewDidEnter() {
    this.clearVariables();
    this.init();
  }

  async init() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.sentences = this.articleDictationService.divideToSentences(
      this.dictation.article,
      this.articleDictationService.sentenceLengthOptionsToValue(this.dictation.sentenceLength)
    );
    this.log.debug(`divided into ${this.sentences.length} sentences`);
    this.speak();
  }

  slower() {
    this.speakingRate = this.speakingRate - 0.1;
    if (this.speakingRate < 0.01) { this.speakingRate = 0.1; }
  }

  faster() {
    this.speakingRate = this.speakingRate + 0.1;
    if (this.speakingRate > 0.99) { this.speakingRate = 1.0; }
  }

  speak() {
    this.speechService.speak(this.sentences[this.currentSentence], this.speakingRate);
  }

  submitAnswer() {
    this.histories.unshift(
      this.articleDictationService.checkAnswer(this.sentences[this.currentSentence], this.answer)
    );

    this.currentSentence++;
    this.answer = '';

    if (this.currentSentence >= this.sentences.length) {
      this.navigationService.articleDictationComplete(this.dictation, this.histories.reverse());
    } else {
      this.speak();
    }
  }

  onKeyPress(key: string) {
    this.answer += key;
  }

  onBackspace(any) {
    this.answer = this.answer.slice(0, this.answer.length - 1);
  }

  clickShowKeyboard() {
    this.showKeyboard = !this.showKeyboard;
    this.uiOptionsService.saveOption(UIOptionsService.keys.disableKeyboard, !this.showKeyboard);
  }

}
