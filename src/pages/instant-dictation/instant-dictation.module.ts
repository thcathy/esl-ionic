import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstantDictationPage } from './instant-dictation';

@NgModule({
  declarations: [
    InstantDictationPage,
  ],
  imports: [
    IonicPageModule.forChild(InstantDictationPage),
  ],
})
export class InstantDictationPageModule {}
