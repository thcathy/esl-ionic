import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchDictationPage } from './search-dictation';

@NgModule({
  declarations: [
    SearchDictationPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchDictationPage),
  ],
})
export class SearchDictationPageModule {}
