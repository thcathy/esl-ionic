import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit {
  _character: string;
  isBlink = false;

  @Input()
  set character(character: string) {
    this._character = character;
    this.isBlink = character === '_';
  }

  constructor() { }

  ngOnInit() {}

}
