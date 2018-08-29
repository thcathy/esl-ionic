import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleDictationCompletePage } from './article-dictation-complete.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: ArticleDictationCompletePage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticleDictationCompletePage]
})
export class ArticleDictationCompletePageModule {}
