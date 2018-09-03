import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DictationViewPage } from './dictation-view.page';
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

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
