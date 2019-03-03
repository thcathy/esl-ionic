import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MemberVocabulary} from '../../entity/member-vocabulary';

@Component({
  selector: 'app-vocab-history-list',
  templateUrl: 'vocab-history-list.html',
  styleUrls: ['vocab-history-list.scss'],
})
export class VocabHistoryListComponent implements OnChanges {
  private vocabPerPage = 10;

  @Input() vocabs: Map<string, MemberVocabulary>;
  @Input() title: string;
  @Input() icon: string;
  @Input() showReview: boolean;
  @Output() click = new EventEmitter<string>();

  viewVocabs: Array<MemberVocabulary>;
  page: number;
  showNext: boolean;

  vocabComparator = (a: [string, MemberVocabulary], b: [string, MemberVocabulary]) => {
    if (b[1].correct === a[1].correct) {
      return a[1].wrong - b[1].wrong;
    } else {
      return b[1].correct - a[1].correct;
    }
  }

  constructor() {
    this.page = 0;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.page = 0;
    this.vocabs = new Map([...this.vocabs.entries()].sort(this.vocabComparator));
    if (this.vocabs != null) {
      this.sliceVocabs();
      this.showNext = this.vocabs.size > this.vocabPerPage;
    }
  }

  next() {
    this.page++;
    this.sliceVocabs();
    this.showNext = this.vocabs.size > this.vocabPerPage * (this.page + 1);
  }

  previous() {
    this.page--;
    this.sliceVocabs();
    this.showNext = true;
  }

  sliceVocabs() {
    const histories = Array.from(this.vocabs.entries()).map(e => e[1]);
    this.viewVocabs = histories.slice(this.page * this.vocabPerPage, (this.page + 1) * this.vocabPerPage);
  }

  onClick(key: string) {
    this.click.emit(key);
  }
}
