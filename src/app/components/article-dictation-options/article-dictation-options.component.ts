import {Component, OnInit, ViewChild} from '@angular/core';
import {IonToggle} from "@ionic/angular";
import {UIOptionsService} from "../../services/ui-options.service";

@Component({
    selector: 'app-article-dictation-options',
    templateUrl: './article-dictation-options.component.html',
    styleUrls: ['./article-dictation-options.component.scss'],
    standalone: false
})
export class ArticleDictationOptionsComponent implements OnInit {
  @ViewChild('caseSensitive') caseSensitive: IonToggle;
  @ViewChild('checkPunctuation') checkPunctuation: IonToggle;
  @ViewChild('speakPunctuation') speakPunctuation: IonToggle;

  caseSensitiveKey = 'ArticleDictationOptionsComponent.caseSensitive';
  checkPunctuationKey = 'ArticleDictationOptionsComponent.checkPunctuationKey';
  speakPunctuationKey = 'ArticleDictationOptionsComponent.speakPunctuationKey';

  constructor(public uiOptionsService: UIOptionsService) { }

  ngOnInit() {
    this.uiOptionsService.loadOption(this.caseSensitiveKey).then(v => this.caseSensitive.checked = v);
    this.uiOptionsService.loadOption(this.checkPunctuationKey).then(v => this.checkPunctuation.checked = v);
    this.uiOptionsService.loadOption(this.speakPunctuationKey).then(v => this.speakPunctuation.checked = v);
  }

  optionChanged($event, key: string) {
    if ($event?.detail?.checked !== undefined) {
      this.uiOptionsService.saveOption(key, $event.detail.checked);
    }
  }
}
