import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchDictationPage } from './search-dictation.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: SearchDictationPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SearchDictationPage]
})
export class SearchDictationPageModule {}
