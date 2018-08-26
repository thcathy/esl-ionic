import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DictationPracticePage } from './dictation-practice.page';

describe('DictationPracticePage', () => {
  let component: DictationPracticePage;
  let fixture: ComponentFixture<DictationPracticePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DictationPracticePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationPracticePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
