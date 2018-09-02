import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberHomePage } from './member-home.page';
import {SharedModule} from "../../shared.module";

const routes: Routes = [
  {
    path: '',
    component: MemberHomePage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MemberHomePage]
})
export class MemberHomePageModule {}
