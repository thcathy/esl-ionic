import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {DictationPreloadComponent, PreloadCategoryName} from './dictation-preload.component';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('DictationPreloadComponent', () => {
  let component: DictationPreloadComponent;
  let fixture: ComponentFixture<DictationPreloadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DictationPreloadComponent],
      imports: [SharedTestModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationPreloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with idle state for all categories', () => {
    expect(component.questions.state).toBe('idle');
    expect(component.voices.state).toBe('idle');
    expect(component.images.state).toBe('idle');
  });

  it('start sets total for each category', () => {
    component.start({ questions: 5, voices: 5, images: 3 });
    expect(component.questions.total).toBe(5);
    expect(component.voices.total).toBe(5);
    expect(component.images.total).toBe(3);
  });

  it('completeCategory jumps loaded to total and marks done', () => {
    component.start({ questions: 5, voices: 5, images: 5 });
    component.completeCategory(PreloadCategoryName.Voices);
    expect(component.voices.loaded).toBe(5);
    expect(component.voices.state).toBe('done');
  });

  it('recordVoice increments loaded on success', () => {
    component.start({ questions: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    expect(component.voices.loaded).toBe(1);
    expect(component.voices.state).toBe('loading');
  });

  it('recordVoice marks done when total reached without failures', () => {
    component.start({ questions: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    component.recordVoice(true);
    expect(component.voices.state).toBe('done');
  });

  it('recordVoice marks failed when total reached with any failure', () => {
    component.start({ questions: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    component.recordVoice(false);
    expect(component.voices.state).toBe('failed');
  });

  it('emits preloadCompleted with useLocalVoice=false when all categories succeed', fakeAsync(() => {
    let result: any = null;
    component.preloadCompleted.subscribe(r => result = r);

    component.start({ questions: 1, voices: 1, images: 1 });
    component.completeCategory(PreloadCategoryName.Questions);
    component.completeCategory(PreloadCategoryName.Images);
    component.recordVoice(true);
    tick(2500); // covers MIN_DISPLAY_MS (2000ms) + one loop interval
    expect(result).toEqual({ useLocalVoice: false });
  }));

  it('shows continue button when voices fail', fakeAsync(() => {
    component.start({ questions: 1, voices: 1, images: 1 });
    component.completeCategory(PreloadCategoryName.Questions);
    component.completeCategory(PreloadCategoryName.Images);
    component.recordVoice(false);
    tick(500);
    expect(component.showContinueButton).toBeTrue();
  }));

  it('emits preloadCompleted with useLocalVoice=true on continue button click', () => {
    let result: any = null;
    component.preloadCompleted.subscribe(r => result = r);
    component.onContinueWithLocalVoice();
    expect(result).toEqual({ useLocalVoice: true });
  });

  it('getPercent returns 100 for completed category', () => {
    component.start({ questions: 5, voices: 5, images: 5 });
    component.completeCategory(PreloadCategoryName.Questions);
    expect(component.getPercent(component.questions)).toBe(100);
  });

  it('getPercent returns correct percentage during loading', () => {
    component.start({ questions: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    expect(component.getPercent(component.voices)).toBe(50);
  });
});
