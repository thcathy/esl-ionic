import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {NavigationService} from '../../services/navigation.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'dictation-list',
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
  ]
})
export class DictationListComponent implements OnChanges {
  private dictationPerPage = 5;

  @Input() dictations: Array<Dictation>;
  @Input() showCreateButton: boolean;
  @Input() title: string;
  @Input() loading: boolean;

  viewDictations: Array<Dictation>;
  page: number;
  showOlder: boolean;
  state = 'center';

  constructor(
    public navService: NavigationService,
  ) {
    this.page = 0;
    this.showCreateButton = false;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.page = 0;
    if (this.dictations != null) {
      this.sliceDictations();
      this.showOlder = this.dictations.length > this.dictationPerPage;
    }
  }

  older() {
    this.page++;
    this.showOlder = this.dictations.length >  this.dictationPerPage * (this.page + 1);
    this.state = 'left';
  }

  newer() {
    this.page--;
    this.showOlder = true;
    this.state = 'right';
  }

  sliceDictations() {
    this.viewDictations = this.dictations.slice(this.page * this.dictationPerPage, (this.page + 1) * this.dictationPerPage);
  }

  onDone($event) {
    this.sliceDictations();
    if (this.state === 'left') {
      this.state = 'right-end';
    } else if (this.state === 'right') {
      this.state = 'left-end';
    } else if (this.state.endsWith('-end')) {
      this.state = 'center';
    }
  }

}
