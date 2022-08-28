import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from "../shared.module";
import { HomePage } from './home.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
