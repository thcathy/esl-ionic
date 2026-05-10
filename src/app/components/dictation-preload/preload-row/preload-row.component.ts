import {Component, Input} from '@angular/core';
import {PreloadCategory} from '../dictation-preload.component';

@Component({
  selector: 'app-preload-row',
  templateUrl: './preload-row.component.html',
  styleUrls: ['./preload-row.component.scss'],
  standalone: false,
})
export class PreloadRowComponent {
  @Input({required: true}) category!: PreloadCategory;
  @Input({required: true}) label!: string;
  @Input() iconClass = '';
  @Input() fillClass = '';
  @Input() failedLabel?: string;
  @Input() resetting = false;

  get percent(): number {
    if (this.category.total === 0) { return 100; }
    return Math.round(((this.category.loaded + this.category.failed) / this.category.total) * 100);
  }

  get showFailure(): boolean {
    return this.category.state === 'failed' && !!this.failedLabel;
  }
}
