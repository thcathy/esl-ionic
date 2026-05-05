import {Component, ViewChild} from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {IonInput} from '@ionic/angular';
import {VirtualKeyboardEvent} from '../../components/virtual-keyboard/virtual-keyboard';
import {DictationPreloadComponent, PreloadCategoryName, PreloadResult} from '../../components/dictation-preload/dictation-preload.component';
import {Dictation} from '../../entity/dictation';
import {SentenceHistory} from '../../entity/sentence-history';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {NavigationService} from '../../services/navigation.service';
import {SpeechService} from '../../services/speech.service';
import {StorageService} from '../../services/storage.service';
import {TranslateService} from "@ngx-translate/core";
import {UIOptionsService} from '../../services/ui-options.service';

@Component({
    selector: 'app-article-dictation',
    templateUrl: './article-dictation.page.html',
    styleUrls: ['./article-dictation.page.scss'],
    standalone: false
})
export class ArticleDictationPage {
  @ViewChild('answerInput') answerInput: IonInput;
  @ViewChild('preload', { static: true }) preload: DictationPreloadComponent;

  dictation: Dictation;
  sentences: string[];
  speakingRate = 0.7;
  currentIndex = 0;
  mark = 0;
  answer = '';
  histories: SentenceHistory[] = [];
  isKeyboardActive: boolean;
  voiceMode: string;
  showPreload = true;

  get caseSensitiveText() {
    return this?.dictation?.options?.caseSensitiveSentence ? 'Case Sensitive' : 'Case Insensitive';
  }

  get checkPunctuationText() {
    return this?.dictation?.options?.checkPunctuation ? 'Check Punctuation' : 'No Punctuation';
  }

  get currentSentence() {
    return this.sentences?.length > this.currentIndex ? this.sentences[this.currentIndex] : '';
  }

  constructor(
    public articleDictationService: ArticleDictationService,
    public speechService: SpeechService,
    public storage: StorageService,
    public navigationService: NavigationService,
    protected translate: TranslateService,
    private log: NGXLogger,
  ) {}

  clearVariables() {
    this.currentIndex = 0;
    this.mark = 0;
    this.answer = '';
    this.sentences = [];
    this.histories = [];
    this.dictation = null;
    this.showPreload = true;
  }

  ionViewDidEnter() {
    this.clearVariables();
    this.init();
  }

  async init() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.voiceMode = await this.speechService.getVoiceMode();
    this.sentences = this.articleDictationService.divideToSentences(
      this.dictation.article,
      this.articleDictationService.sentenceLengthOptionsToValue(this.dictation.sentenceLength)
    );
    this.log.debug(`divided into ${this.sentences.length} sentences`);
    this.initPreload();
  }

  onPreloadCompleted(result: PreloadResult) {
    if (result.useLocalVoice) { this.voiceMode = UIOptionsService.voiceMode.local; }
    this.showPreload = false;
    this.speak();
    this.focusAnswerInput();
  }

  private initPreload() {
    const total = this.sentences.length;
    const isVoiceModeOnline = this.voiceMode === UIOptionsService.voiceMode.online;

    this.preload.start({ questions: total, voices: isVoiceModeOnline ? total : 0, images: 0 });

    if (isVoiceModeOnline) {
      this.sentences.forEach(sentence => {
        this.speechService.prefetchByVoiceMode(sentence, {
          speakPunctuation: !!this.dictation?.options?.speakPunctuation,
          mode: this.voiceMode,
        }).then(success => this.preload.recordVoice(success));
      });
    }

    this.preload.completeCategory(PreloadCategoryName.Questions);
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
    const sentence = this.sentences?.[this.currentIndex];
    if (!sentence) {
      return;
    }
    void this.speechService.speakByVoiceMode(sentence, {
      rate: this.speakingRate,
      speakPunctuation: !!this.dictation?.options?.speakPunctuation,
      mode: this.voiceMode,
    });
  }

  submitAnswer() {
    this.histories.unshift(
      this.articleDictationService.checkAnswer(
        this.sentences[this.currentIndex], this.answer, {
          caseSensitive: this.dictation?.options?.caseSensitiveSentence,
          checkPunctuation: this.dictation?.options?.checkPunctuation,
        }
      )
    );

    this.currentIndex++;
    this.answer = '';

    if (this.currentIndex >= this.sentences.length) {
      this.navigationService.articleDictationComplete(this.dictation, this.histories.reverse());
    } else {
      this.speak();
      this.focusAnswerInput();
    }
  }

  onKeyPress(key: string) {
    this.answer += key;
  }

  onKeyboardEvent(event: VirtualKeyboardEvent) {
    switch (event) {
      case VirtualKeyboardEvent.Backspace:
        this.backspace();
        break;
      case VirtualKeyboardEvent.Clear:
        this.answer = '';
        break;
      case VirtualKeyboardEvent.Close:
        this.isKeyboardActive = false;
        this.focusAnswerInput();
        break;
      case VirtualKeyboardEvent.Open:
        this.isKeyboardActive = true;
        break;
    }
  }
  backspace() {
    this.answer = this.answer.slice(0, this.answer.length - 1);
  }

  private focusAnswerInput() {
    if (!this.isKeyboardActive && this.answerInput) {
      setTimeout(() => this.answerInput.setFocus(), 100);
    }
  }
}
