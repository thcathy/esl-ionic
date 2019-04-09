import { NgModule } from '@angular/core';
import {SafeHtmlPipe} from './safe-html/safe-html';
import { DictationQuestionsPipe } from './dictation/dictation-questions.pipe';
import { TruncatePipe } from './truncate.pipe';
import { MemberNamePipe } from './member/member-name.pipe';

@NgModule({
  declarations: [SafeHtmlPipe, DictationQuestionsPipe, TruncatePipe, MemberNamePipe],
  imports: [],
  exports: [SafeHtmlPipe, DictationQuestionsPipe, TruncatePipe, MemberNamePipe]
})
export class PipesModule {}
