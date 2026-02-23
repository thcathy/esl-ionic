import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {IonToggle} from '@ionic/angular';
import {UIOptionsService} from '../../services/ui-options.service';

@Component({
    selector: 'app-article-dictation-options',
    templateUrl: './article-dictation-options.component.html',
    styleUrls: ['./article-dictation-options.component.scss'],
    standalone: false
})
export class ArticleDictationOptionsComponent implements AfterViewInit {
  @ViewChild('caseSensitive') caseSensitive: IonToggle;
  @ViewChild('checkPunctuation') checkPunctuation: IonToggle;
  @ViewChild('speakPunctuation') speakPunctuation: IonToggle;

  caseSensitiveKey = 'ArticleDictationOptionsComponent.caseSensitive';
  checkPunctuationKey = 'ArticleDictationOptionsComponent.checkPunctuationKey';
  speakPunctuationKey = 'ArticleDictationOptionsComponent.speakPunctuationKey';

  constructor(public uiOptionsService: UIOptionsService) {}

  async ngAfterViewInit(): Promise<void> {
    const [caseSensitive, checkPunctuation, speakPunctuation] = await Promise.all([
      this.uiOptionsService.loadOption(this.caseSensitiveKey),
      this.uiOptionsService.loadOption(this.checkPunctuationKey),
      this.uiOptionsService.loadOption(this.speakPunctuationKey),
    ]);
    this.caseSensitive.checked = this.toBoolean(caseSensitive);
    this.checkPunctuation.checked = this.toBoolean(checkPunctuation);
    this.speakPunctuation.checked = this.toBoolean(speakPunctuation);
  }

  optionChanged(event: { detail?: { checked?: boolean } }, key: string): void {
    if (event?.detail?.checked !== undefined) {
      void this.uiOptionsService.saveOption(key, event.detail.checked === true);
    }
  }

  private toBoolean(value: unknown): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
  }
}
