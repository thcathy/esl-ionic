import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleDictationPage } from './article-dictation.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: ArticleDictationPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticleDictationPage]
})
export class ArticleDictationPageModule {}
