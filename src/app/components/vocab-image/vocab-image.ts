import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'vocab-image',
  templateUrl: 'vocab-image.html',
  styleUrls: ['vocab-image.scss'],
  animations: [
    trigger('move', [
      state('center', style({ transform: 'translateX(0%)' })),
      state('left', style({ transform: 'translateX(-200%)' })),
      state('right', style({ transform: 'translateX(200%)' })),
      state('left-end', style({ transform: 'translateX(-200%)' })),
      state('right-end', style({ transform: 'translateX(200%)' })),
      transition('center <=> *', [
        animate(200)
      ])
    ])
  ],
})
export class VocabImageComponent implements OnChanges {
  @Input() images: string[];
  index: number;
  state = 'center';
  imageBase64 = '';

  constructor() {
    this.index = 0;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.index = 0;
    this.imageBase64 = this.images[0];
  }

  nextImage() {
    this.state = 'right';
    this.index++;
    if (this.index >= this.images.length) { this.index = 0; }
  }

  previousImage() {
    this.state = 'left';
    this.index--;
    if (this.index < 0) {
      this.index = this.images.length - 1;
    }
  }

  onDone($event) {
    this.imageBase64 = this.images[this.index];
    if (this.state === 'left') {
      this.state = 'right-end';
    } else if (this.state === 'right') {
      this.state = 'left-end';
    } else if (this.state.endsWith('-end')) {
      this.state = 'center';
    }
  }
}
