import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditDictationPage } from './edit-dictation.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: EditDictationPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditDictationPage]
})
export class EditDictationPageModule {}
