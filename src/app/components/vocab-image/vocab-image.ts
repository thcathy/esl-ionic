import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'vocab-image',
  templateUrl: 'vocab-image.html'
})
export class VocabImageComponent implements OnChanges {
  @Input() images: String[];
  index: number;

  constructor() {
    this.index = 0;
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.index = 0;
  }

  nextImage() {
    this.index++;
    if (this.index >= this.images.length) this.index=0;
  }

  previousImage() {
    this.index--;
    if (this.index < 0)
      this.index = this.images.length - 1;
  }
}
