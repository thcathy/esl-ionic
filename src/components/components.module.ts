import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MemberScoreRankingComponent } from './member-score-ranking/member-score-ranking';
import { DictationStatisticsComponent } from './dictation-statistics/dictation-statistics';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
	declarations: [MemberScoreRankingComponent,
    DictationStatisticsComponent],
	imports: [
	  IonicModule,
    TranslateModule,
  ],
	exports: [MemberScoreRankingComponent,
    DictationStatisticsComponent]
})
export class ComponentsModule {}
