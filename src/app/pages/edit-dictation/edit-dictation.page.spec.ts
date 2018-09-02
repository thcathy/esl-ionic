import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDictationPage } from './edit-dictation.page';

describe('EditDictationPage', () => {
  let component: EditDictationPage;
  let fixture: ComponentFixture<EditDictationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDictationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
