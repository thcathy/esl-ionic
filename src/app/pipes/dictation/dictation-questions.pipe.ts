import { Pipe, PipeTransform } from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {DictationService} from '../../services/dictation/dictation.service';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'dictationQuestions'
})
export class DictationQuestionsPipe implements PipeTransform {

  constructor(public dictationService: DictationService,
              public articleDictationService: ArticleDictationService,
              public translate: TranslateService) {
  }

  transform(value: Dictation, args?: any): string {
    if (this.dictationService.isSentenceDictation(value)) {
      return this.articleDictationService.divideToSentences(value.article).length + ' ' + this.translate.instant('Sentence');
    } else {
      return value.vocabs.length + ' ' + this.translate.instant('Vocab(s)');
    }
  }

}
