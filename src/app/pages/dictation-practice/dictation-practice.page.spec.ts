import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DictationPracticePage } from './dictation-practice.page';
import {SharedTestModule} from "../../../testing/shared-test.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('DictationPracticePage', () => {
  let component: DictationPracticePage;
  let fixture: ComponentFixture<DictationPracticePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DictationPracticePage ],
      imports: [
        SharedTestModule.forRoot(),
        NoopAnimationsModule,
      ],
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
