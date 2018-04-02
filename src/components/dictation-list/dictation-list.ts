import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../providers/navigation.service";

@Component({
  selector: 'dictation-list',
  templateUrl: 'dictation-list.html'
})
export class DictationListComponent implements OnChanges {
  private dictationPerPage: number = 5;

  @Input() dictations: Array<Dictation>;
  @Input() showCreateButton: boolean;
  viewDictations: Array<Dictation>;
  page: number;
  showOlder: boolean;

  constructor(
    public navService: NavigationService,
  ) {
    this.page = 0;
    this.showCreateButton = false;
  }

  ngOnChanges(_changes: SimpleChanges) {
    if (this.dictations != null) {
      this.sliceDictations();
      this.showOlder = this.dictations.length > this.dictationPerPage;
    }
  }

  older() {
    this.page++;
    this.sliceDictations();
    this.showOlder = this.dictations.length >  this.dictationPerPage * (this.page+1);
  }

  newer() {
    this.page--;
    this.sliceDictations();
    this.showOlder=true;
  }

  sliceDictations() {
    this.viewDictations = this.dictations.slice(this.page * this.dictationPerPage, (this.page+1) * this.dictationPerPage);
  }
}