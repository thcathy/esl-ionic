import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleDictationCompletePage } from './article-dictation-complete.page';

describe('ArticleDictationCompletePage', () => {
  let component: ArticleDictationCompletePage;
  let fixture: ComponentFixture<ArticleDictationCompletePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleDictationCompletePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDictationCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
