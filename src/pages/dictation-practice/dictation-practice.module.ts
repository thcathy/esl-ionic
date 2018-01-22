import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DictationPracticePage } from './dictation-practice';

@NgModule({
  declarations: [
    DictationPracticePage,
  ],
  imports: [
    IonicPageModule.forChild(DictationPracticePage),
  ],
})
export class DictationPracticePageModule {}
