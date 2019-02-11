import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../services/navigation.service";
import {DisplayService} from "../../services/display.service";
import {MemberVocabulary} from "../../entity/member-vocabulary";

@Component({
  selector: 'vocab-history-list',
  templateUrl: 'vocab-history-list.html',
  styleUrls: ['vocab-history-list.scss'],
})
export class VocabHistoryListComponent implements OnChanges {
  private vocabPerPage: number = 10;

  @Input() vocabs: Map<string, MemberVocabulary>;
  @Input() title: string;
  @Input() icon: string;
  @Input() showReview: boolean;
  @Output() click = new EventEmitter<string>();

  viewVocabs: Array<MemberVocabulary>;
  page: number;
  showNext: boolean;

  constructor() {
    this.page = 0;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.page = 0;
    if (this.vocabs != null) {
      this.sliceVocabs();
      this.showNext = this.vocabs.size > this.vocabPerPage;
    }
  }

  next() {
    this.page++;
    this.sliceVocabs();
    this.showNext = this.vocabs.size > this.vocabPerPage * (this.page+1);
  }

  previous() {
    this.page--;
    this.sliceVocabs();
    this.showNext=true;
  }

  sliceVocabs() {
    const histories = Array.from(this.vocabs.entries()).map(e => e[1]);
    this.viewVocabs = histories.slice(this.page * this.vocabPerPage, (this.page+1) * this.vocabPerPage);
  }

  onClick(key: string) {
    this.click.emit(key);
  }
}
