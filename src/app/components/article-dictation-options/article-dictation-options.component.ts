import {Component, OnInit, ViewChild} from '@angular/core';
import {IonToggle} from "@ionic/angular";
import {UIOptionsService} from "../../services/ui-options.service";

@Component({
  selector: 'app-article-dictation-options',
  templateUrl: './article-dictation-options.component.html',
  styleUrls: ['./article-dictation-options.component.scss'],
})
export class ArticleDictationOptionsComponent implements OnInit {
  @ViewChild('caseSensitive') caseSensitive: IonToggle;
  @ViewChild('includePunctuation') includePunctuation: IonToggle;

  caseSensitiveKey = 'ArticleDictationOptionsComponent.caseSensitive';
  includePunctuationKey = 'ArticleDictationOptionsComponent.includePunctuationKey';

  constructor(public uiOptionsService: UIOptionsService) { }

  ngOnInit() {
    this.uiOptionsService.loadOption(this.caseSensitiveKey).then(v => this.caseSensitive.checked = v);
    this.uiOptionsService.loadOption(this.includePunctuationKey).then(v => this.includePunctuation.checked = v);
  }

  optionChanged($event, key: string) {
   this.uiOptionsService.saveOption(key, $event.detail.checked);
  }
}
