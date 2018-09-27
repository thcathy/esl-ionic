import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VocabularyStarterPage } from './vocabulary-starter.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: VocabularyStarterPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [VocabularyStarterPage]
})
export class VocabularyStarterPageModule {}
