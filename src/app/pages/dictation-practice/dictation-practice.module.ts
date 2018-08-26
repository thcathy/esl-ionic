import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DictationPracticePage } from './dictation-practice.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: DictationPracticePage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DictationPracticePage]
})
export class DictationPracticePageModule {}
