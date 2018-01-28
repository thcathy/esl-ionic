import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MemberScoreRankingComponent } from './member-score-ranking/member-score-ranking';
import { DictationStatisticsComponent } from './dictation-statistics/dictation-statistics';
import {TranslateModule} from "@ngx-translate/core";
import { VocabImageComponent } from './vocab-image/vocab-image';
import { PracticeHistoryListComponent } from './practice-history-list/practice-history-list';
import { ScoreComponent } from './score/score';

@NgModule({
	declarations: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent],
	imports: [
	  IonicModule,
    TranslateModule,
  ],
	exports: [MemberScoreRankingComponent,
    DictationStatisticsComponent,
    VocabImageComponent,
    PracticeHistoryListComponent,
    ScoreComponent]
})
export class ComponentsModule {}
