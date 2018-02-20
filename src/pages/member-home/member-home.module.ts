import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberHomePage } from './member-home';

@NgModule({
  declarations: [
    MemberHomePage,
  ],
  imports: [
    IonicPageModule.forChild(MemberHomePage),
  ],
})
export class MemberHomePageModule {}
