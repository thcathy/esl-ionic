import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss'],
  standalone: false
})
export class SectionCardComponent {
  @Input() headerTitle = '';
  @Input() icon = '';
  @Input() showHeader = true;
}
