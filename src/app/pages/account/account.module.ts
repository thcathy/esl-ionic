import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPage } from './account.page';
import {SharedModule} from '../../shared.module';
import {CanDeactivateGuard} from '../../guards/can-deactivate.guard';
import {MemberResolverService} from './member-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: AccountPage,
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      member: MemberResolverService
    }
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AccountPage]
})
export class AccountPageModule {}
