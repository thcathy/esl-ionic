import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { InstantDictationPage } from './instant-dictation.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: InstantDictationPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InstantDictationPage]
})
export class InstantDictationPageModule {}
