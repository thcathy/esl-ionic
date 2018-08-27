import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ArticleDictationCompletePage } from './article-dictation-complete.page';

const routes: Routes = [
  {
    path: '',
    component: ArticleDictationCompletePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticleDictationCompletePage]
})
export class ArticleDictationCompletePageModule {}
