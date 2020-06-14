import { NgModule } from '@angular/core';
import { MemberScoreRankingComponent } from './member-score-ranking/member-score-ranking';
import { DictationStatisticsComponent } from './dictation-statistics/dictation-statistics';
import {TranslateModule} from '@ngx-translate/core';
import { VocabImageComponent } from './vocab-image/vocab-image';
import { PracticeHistoryListComponent } from './practice-history-list/practice-history-list';
import { ScoreComponent } from './score/score';
import { DictationCardComponent } from './dictation-card/dictation-card';
import { FooterComponent } from './app-footer/footer';
import { DictationListComponent } from './dictation-list/dictation-list';
import {PipesModule} from '../pipes/pipes.module';
import { SentenceHistoriesComponent } from './sentence-histories/sentence-histories';
import { MemberScoreListComponent } from './member-score-list/member-score-list';
import {MemberPracticeHistoryListComponent} from './member-practice-history-list/member-practice-history-list';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {VocabHistoryListComponent} from './vocab-history-list/vocab-history-list';
import {VirtualKeyboardComponent} from './virtual-keyboard/virtual-keyboard';
import {HttpClientModule} from '@angular/common/http';
import {ShareButtonsModule} from 'ngx-sharebuttons/buttons';
import {ShareIconsModule} from 'ngx-sharebuttons/icons';

@NgModule({
  declarations: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent,
    DictationCardComponent,
    FooterComponent,
    DictationListComponent,
    SentenceHistoriesComponent,
    MemberScoreListComponent,
    MemberPracticeHistoryListComponent,
    VocabHistoryListComponent,
    VirtualKeyboardComponent,
  ],
  imports: [
    IonicModule,
    TranslateModule,
    PipesModule,
    FontAwesomeModule,
    CommonModule,
    HttpClientModule,
    ShareButtonsModule.withConfig({
      debug: true
    }),
    ShareIconsModule.forRoot()
  ],
  exports: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent,
    DictationCardComponent,
    FooterComponent,
    DictationListComponent,
    SentenceHistoriesComponent,
    MemberScoreListComponent,
    MemberPracticeHistoryListComponent,
    VocabHistoryListComponent,
    VirtualKeyboardComponent,
  ]
})
export class ComponentsModule {}
