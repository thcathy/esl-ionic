import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantDictationPage } from './instant-dictation.page';
import {SharedTestModule} from "../../../testing/shared-test.module";

describe('InstantDictationPage', () => {
  let component: InstantDictationPage;
  let fixture: ComponentFixture<InstantDictationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstantDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
