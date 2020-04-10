import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ComponentsModule} from './components/components.module';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from './pipes/pipes.module';

@NgModule({
  imports:      [
    CommonModule, FormsModule, IonicModule, FontAwesomeModule,
    TranslateModule, ComponentsModule, PipesModule, ReactiveFormsModule,
  ],
  declarations: [ ],
  exports:      [
    CommonModule, FormsModule, IonicModule, FontAwesomeModule,
    TranslateModule, ComponentsModule, PipesModule, ReactiveFormsModule,
  ]
})
export class SharedModule { }
