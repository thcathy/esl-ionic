import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DictationViewPage } from './dictation-view.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: DictationViewPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DictationViewPage]
})
export class DictationViewPageModule {}
