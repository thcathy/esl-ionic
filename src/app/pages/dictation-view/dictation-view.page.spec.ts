import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DictationViewPage } from './dictation-view.page';
import {SharedTestModule} from "../../../testing/shared-test.module";

describe('DictationViewPage', () => {
  let component: DictationViewPage;
  let fixture: ComponentFixture<DictationViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DictationViewPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
