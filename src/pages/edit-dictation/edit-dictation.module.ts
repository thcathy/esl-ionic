import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditDictationPage } from './edit-dictation';

@NgModule({
  declarations: [
    EditDictationPage,
  ],
  imports: [
    IonicPageModule.forChild(EditDictationPage),
  ],
})
export class EditDictationPageModule {}
