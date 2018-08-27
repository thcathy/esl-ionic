import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleDictationPage } from './article-dictation.page';

describe('ArticleDictationPage', () => {
  let component: ArticleDictationPage;
  let fixture: ComponentFixture<ArticleDictationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleDictationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
