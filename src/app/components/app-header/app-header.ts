import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.html',
  styleUrls: ['app-header.scss'],
})
export class AppHeaderComponent {
  @Input() title: string;

  constructor() {}

}
