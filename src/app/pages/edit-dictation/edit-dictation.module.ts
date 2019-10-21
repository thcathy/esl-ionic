import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditDictationPage } from './edit-dictation.page';
import {SharedModule} from '../../shared.module';
import {CanDeactivateGuard} from '../../guards/can-deactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: EditDictationPage,
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditDictationPage]
})
export class EditDictationPageModule {}
