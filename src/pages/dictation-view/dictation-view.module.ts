import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DictationViewPage } from './dictation-view';

@NgModule({
  declarations: [
    DictationViewPage,
  ],
  imports: [
    IonicPageModule.forChild(DictationViewPage),
  ],
})
export class DictationViewPageModule {}
