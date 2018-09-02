import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

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
