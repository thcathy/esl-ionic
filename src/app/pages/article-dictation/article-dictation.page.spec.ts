import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ArticleDictationPage} from './article-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {AnalyticsService} from '../../services/analytics.service';

describe('ArticleDictationPage', () => {
  let component: ArticleDictationPage;
  let fixture: ComponentFixture<ArticleDictationPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
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

  it('records dictation start once and a result without the sentence', () => {
    const analytics = TestBed.inject(AnalyticsService);
    const start = spyOn(analytics, 'dictationDidStart');
    const finish = spyOn(analytics, 'dictationDidFinish');
    spyOn(component.speechService, 'speakByVoiceMode').and.resolveTo('local');
    component.navigationService.articleDictationComplete = jasmine.createSpy('articleDictationComplete');
    component.sentences = ['Hello there'];
    component.dictation = {options: {}} as any;

    component.ionViewWillLeave();
    component.onPreloadCompleted({useLocalVoice: false});
    expect(start).not.toHaveBeenCalled();

    component.clearVariables();
    component.sentences = ['Hello there'];
    component.dictation = {options: {}} as any;
    component.onPreloadCompleted({useLocalVoice: false});
    component.onPreloadCompleted({useLocalVoice: false});
    expect(start).toHaveBeenCalledTimes(1);

    component.answer = 'Hello there';
    component.submitAnswer();
    component.submitAnswer();

    expect(finish).toHaveBeenCalledTimes(1);
    const summary = finish.calls.mostRecent().args[0];
    expect(summary.success).toBeTrue();
    expect(summary.wordCount).toBeGreaterThan(0);
    expect(summary.errorType).toBeUndefined();
    expect(JSON.stringify(summary)).not.toContain('Hello');

    component.clearVariables();
    component.sentences = ['Hello there'];
    component.dictation = {options: {}} as any;
    component.answer = 'nope';
    component.submitAnswer();
    expect(finish).toHaveBeenCalledTimes(2);
  });
});
