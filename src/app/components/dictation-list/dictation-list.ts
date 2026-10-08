import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, Dictations} from '../../entity/dictation';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {DICTATION_SEARCH_MAX_RESULTS} from '../../services/dictation/dictation.service';
import {NavigationService} from '../../services/navigation.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AppService} from '../../services/app.service';

@Component({
    selector: 'app-dictation-list',
    templateUrl: 'dictation-list.html',
    styleUrls: ['dictation-list.scss'],
    animations: [
        trigger('move', [
            state('center', style({ transform: 'translateX(0%)' })),
            state('left', style({ transform: 'translateX(-200%)' })),
            state('right', style({ transform: 'translateX(200%)' })),
            state('left-end', style({ transform: 'translateX(-200%)' })),
            state('right-end', style({ transform: 'translateX(200%)' })),
            transition('center <=> *', [
                animate(250)
            ])
        ])
    ],
    standalone: false
})
export class DictationListComponent implements OnChanges {
  private dictationPerPage = 5;

  @Input() dictations: Array<Dictation>;
  @Input() showCreateButton: boolean;
  @Input() title: string;
  @Input() loading: boolean;
  @Input() openById = false;
  /** Search results: match count above the list, and Previous / Next instead of Newer / Older. */
  @Input() showResultSummary = false;
  /** When the held list reaches this size, the total is a cap, not an exact count. */
  @Input() resultCap = DICTATION_SEARCH_MAX_RESULTS;

  viewDictations: Array<Dictation>;
  page: number;
  state = 'center';

  get DictationSource() { return Dictations.Source; }
  get source() {
    if (this.dictations === undefined || this.dictations.length < 1) {
      return Dictations.Source.FillIn;
    } else {
      return this.dictations[0].source;
    }
  }

  constructor(
    public navService: NavigationService,
    public appService: AppService,
    private dictationHelper: DictationHelper,
    private translate: TranslateService,
  ) {
    this.page = 0;
    this.showCreateButton = false;
  }

  get showOlder(): boolean {
    return this.dictations != null && this.dictations.length > this.dictationPerPage * (this.page + 1);
  }

  get hasPreviousPage(): boolean {
    return this.page > 0;
  }

  get hitsResultCap(): boolean {
    return this.resultCap > 0 && (this.dictations?.length ?? 0) >= this.resultCap;
  }

  get resultSummaryKey(): string {
    return this.hitsResultCap ? 'SearchDictation.ShowingCapped' : 'SearchDictation.Showing';
  }

  get resultSummaryText(): string {
    return this.translate.instant(this.resultSummaryKey, this.resultSummaryParams);
  }

  get resultSummaryParams(): {range: string; count: number} {
    const total = this.dictations?.length ?? 0;
    const from = this.page * this.dictationPerPage + 1;
    const to = Math.min(total, (this.page + 1) * this.dictationPerPage);
    return {
      range: from === to ? `${from}` : `${from}\u2013${to}`,
      count: this.hitsResultCap ? this.resultCap : total,
    };
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.page = 0;
    if (this.dictations != null) {
      this.sliceDictations();
    }
  }

  older() {
    if (!this.showOlder) {
      return;
    }
    this.page++;
    this.state = 'right';
    this.sliceDictations();
  }

  newer() {
    if (!this.hasPreviousPage) {
      return;
    }
    this.page--;
    this.state = 'left';
    this.sliceDictations();
  }

  sliceDictations() {
    this.viewDictations = this.dictations.slice(this.page * this.dictationPerPage, (this.page + 1) * this.dictationPerPage);
  }

  previewLine(dictation: Dictation): string {
    return this.dictationHelper.previewLine(dictation);
  }

  viewDictation(dictation: Dictation) {
    if (this.openById) {
      this.navService.openDictationById(dictation.id, true);
    } else {
      this.navService.pushOpenDictation(dictation);
    }
  }

  onDone($event) {
    if (this.state.endsWith('-end')) {
      this.state = 'center';
    } else if (this.state === 'left') {
      this.state = 'right-end';
    } else if (this.state === 'right') {
      this.state = 'left-end';
    }
  }

}
