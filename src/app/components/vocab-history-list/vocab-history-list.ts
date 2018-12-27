import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
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

  viewVocabs: Array<MemberVocabulary>;
  page: number;
  showOlder: boolean;

  constructor(
    public navService: NavigationService,
    public displayService: DisplayService,
  ) {
    this.page = 0;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.page = 0;
    if (this.vocabs != null) {
      this.sliceVocabs();
      this.showOlder = this.vocabs.size > this.vocabPerPage;
    }
  }

  older() {
    this.page++;
    this.sliceVocabs();
    this.showOlder = this.vocabs.size >  this.vocabPerPage * (this.page+1);
  }

  newer() {
    this.page--;
    this.sliceVocabs();
    this.showOlder=true;
  }

  sliceVocabs() {
    const tmp = Array.from(this.vocabs.entries()).map(e => e[1]);
    this.viewVocabs = tmp.slice(this.page * tmp.length, (this.page+1) * tmp.length);
  }
}
