import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {DictationPreloadComponent} from './dictation-preload.component';
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
    expect(component.dictionary.state).toBe('idle');
    expect(component.voices.state).toBe('idle');
    expect(component.images.state).toBe('idle');
  });

  it('setTotals sets total for each category', () => {
    component.setTotals({ dictionary: 5, voices: 5, images: 3 });
    expect(component.dictionary.total).toBe(5);
    expect(component.voices.total).toBe(5);
    expect(component.images.total).toBe(3);
  });

  it('completeCategory jumps loaded to total and marks done', () => {
    component.setTotals({ dictionary: 5, voices: 5, images: 5 });
    component.completeCategory('voices');
    expect(component.voices.loaded).toBe(5);
    expect(component.voices.state).toBe('done');
  });

  it('recordVoice increments loaded on success', () => {
    component.setTotals({ dictionary: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    expect(component.voices.loaded).toBe(1);
    expect(component.voices.state).toBe('loading');
  });

  it('recordVoice marks done when total reached without failures', () => {
    component.setTotals({ dictionary: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    component.recordVoice(true);
    expect(component.voices.state).toBe('done');
  });

  it('recordVoice marks failed when total reached with any failure', () => {
    component.setTotals({ dictionary: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    component.recordVoice(false);
    expect(component.voices.state).toBe('failed');
  });

  it('emits preloadDone when all categories succeed', fakeAsync(() => {
    let emitted = false;
    component.preloadDone.subscribe(() => emitted = true);

    component.setTotals({ dictionary: 1, voices: 1, images: 1 });
    component.completeCategory('dictionary');
    component.completeCategory('images');
    component.recordVoice(true);
    tick(2000); // covers AUTO_TRANSITION_DELAY_MS + MIN_DISPLAY_MS
    expect(emitted).toBeTrue();
  }));

  it('shows continue button when voices fail', fakeAsync(() => {
    component.setTotals({ dictionary: 1, voices: 1, images: 1 });
    component.completeCategory('dictionary');
    component.completeCategory('images');
    component.recordVoice(false);
    tick();
    expect(component.showContinueButton).toBeTrue();
  }));

  it('emits continueWithLocalVoice on button click', () => {
    let emitted = false;
    component.continueWithLocalVoice.subscribe(() => emitted = true);
    component.onContinueWithLocalVoice();
    expect(emitted).toBeTrue();
  });

  it('getPercent returns 100 for completed category', () => {
    component.setTotals({ dictionary: 5, voices: 5, images: 5 });
    component.completeCategory('dictionary');
    expect(component.getPercent(component.dictionary)).toBe(100);
  });

  it('getPercent returns correct percentage during loading', () => {
    component.setTotals({ dictionary: 1, voices: 2, images: 1 });
    component.recordVoice(true);
    expect(component.getPercent(component.voices)).toBe(50);
  });
});
