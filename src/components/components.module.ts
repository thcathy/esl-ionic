import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MemberScoreRankingComponent } from './member-score-ranking/member-score-ranking';
import { DictationStatisticsComponent } from './dictation-statistics/dictation-statistics';

@NgModule({
	declarations: [MemberScoreRankingComponent,
    DictationStatisticsComponent],
	imports: [IonicModule],
	exports: [MemberScoreRankingComponent,
    DictationStatisticsComponent]
})
export class ComponentsModule {}
