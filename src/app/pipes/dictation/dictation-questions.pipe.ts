import {Pipe, PipeTransform} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {TranslateService} from '@ngx-translate/core';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';

@Pipe({
    name: 'dictationQuestions',
    standalone: false
})
export class DictationQuestionsPipe implements PipeTransform {

  constructor(public dictationHelper: DictationHelper,
              public articleDictationService: ArticleDictationService,
              public translate: TranslateService) {
  }

  transform(value: Dictation, args?: any): string {
    if (this.dictationHelper.isSentenceDictation(value)) {
      return this.articleDictationService.divideToSentences(value.article).length + ' ' + this.translate.instant('Sentence');
    } else {
      return value.vocabs.length + ' ' + this.translate.instant('Vocab(s)');
    }
  }

}
