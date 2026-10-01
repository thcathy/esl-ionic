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

  transform(value: Dictation, _args?: any): string {
    const sentence = this.dictationHelper.isSentenceDictation(value);
    const count = this.countFromContent(value, sentence);
    const unit = sentence ? 'Sentence' : 'Vocab(s)';
    return count + ' ' + this.translate.instant(unit);
  }

  private countFromContent(value: Dictation, sentence: boolean): number {
    if (sentence) {
      return this.articleDictationService.divideToSentences(value.article).length;
    }
    return value.vocabs?.length ?? 0;
  }

}
