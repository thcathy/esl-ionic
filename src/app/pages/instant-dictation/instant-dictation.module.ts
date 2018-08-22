import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InstantDictationPage } from './instant-dictation.page';

const routes: Routes = [
  {
    path: '',
    component: InstantDictationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InstantDictationPage]
})
export class InstantDictationPageModule {}
