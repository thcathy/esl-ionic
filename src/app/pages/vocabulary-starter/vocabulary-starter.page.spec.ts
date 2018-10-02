import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyStarterPage } from './vocabulary-starter.page';
import {SharedTestModule} from "../../../test-config/shared-test.module";

describe('VocabularyStarterPage', () => {
  let component: VocabularyStarterPage;
  let fixture: ComponentFixture<VocabularyStarterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabularyStarterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        SharedTestModule.forRoot(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyStarterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
