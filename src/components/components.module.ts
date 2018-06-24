import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MemberScoreRankingComponent } from './member-score-ranking/member-score-ranking';
import { DictationStatisticsComponent } from './dictation-statistics/dictation-statistics';
import {TranslateModule} from "@ngx-translate/core";
import { VocabImageComponent } from './vocab-image/vocab-image';
import { PracticeHistoryListComponent } from './practice-history-list/practice-history-list';
import { ScoreComponent } from './score/score';
import { AppHeaderComponent } from './app-header/app-header';
import { DictationCardComponent } from './dictation-card/dictation-card';
import { FooterComponent } from './footer/footer';
import { DictationListComponent } from './dictation-list/dictation-list';
import {PipesModule} from "../pipes/pipes.module";
import { SentenceHistoriesComponent } from './sentence-histories/sentence-histories';
import { MemberScoreListComponent } from './member-score-list/member-score-list';
import {MemberPracticeHistoryListComponent} from "./member-practice-history-list/member-practice-history-list";

@NgModule({
	declarations: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent,
    AppHeaderComponent,
    DictationCardComponent,
    FooterComponent,
    DictationListComponent,
    SentenceHistoriesComponent,
    MemberScoreListComponent,
    MemberPracticeHistoryListComponent,
  ],
	imports: [
	  IonicModule,
    TranslateModule,
    PipesModule,
  ],
	exports: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent,
    AppHeaderComponent,
    DictationCardComponent,
    FooterComponent,
    DictationListComponent,
    SentenceHistoriesComponent,
    MemberScoreListComponent,
    MemberPracticeHistoryListComponent,
  ]
})
export class ComponentsModule {}
