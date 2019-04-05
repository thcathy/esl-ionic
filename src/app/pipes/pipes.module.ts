import { NgModule } from '@angular/core';
import {SafeHtmlPipe} from './safe-html/safe-html';
import { DictationQuestionsPipe } from './dictation/dictation-questions.pipe';

@NgModule({
  declarations: [SafeHtmlPipe, DictationQuestionsPipe],
  imports: [],
  exports: [SafeHtmlPipe, DictationQuestionsPipe]
})
export class PipesModule {}
