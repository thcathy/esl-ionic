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

  it('setDictionaryInstantDone sets done state', () => {
    component.setDictionaryInstantDone();
    expect(component.dictionary.state).toBe('done');
  });

  it('setVoicesInstantDone sets done state', () => {
    component.setVoicesInstantDone();
    expect(component.voices.state).toBe('done');
  });

  it('setImagesInstantDone sets done state', () => {
    component.setImagesInstantDone();
    expect(component.images.state).toBe('done');
  });

  it('trackVoice increments total and moves to loading', () => {
    component.trackVoice(new Promise(() => {}));
    expect(component.voices.total).toBe(1);
    expect(component.voices.state).toBe('loading');
  });

  it('emits preloadDone when all categories succeed', fakeAsync(() => {
    let emitted = false;
    component.preloadDone.subscribe(() => emitted = true);

    component.setDictionaryInstantDone();
    component.setImagesInstantDone();
    component.trackVoice(Promise.resolve(true));
    component.markVoicesComplete();
    tick();
    tick(1000); // auto-transition delay
    expect(emitted).toBeTrue();
  }));

  it('shows continue button when voices fail', fakeAsync(() => {
    component.setDictionaryInstantDone();
    component.setImagesInstantDone();
    component.trackVoice(Promise.resolve(false));
    component.markVoicesComplete();
    tick();
    expect(component.showContinueButton).toBeTrue();
  }));

  it('emits continueWithLocalVoice on button click', () => {
    let emitted = false;
    component.continueWithLocalVoice.subscribe(() => emitted = true);
    component.onContinueWithLocalVoice();
    expect(emitted).toBeTrue();
  });

  it('getPercent returns 100 for done category', () => {
    component.setDictionaryInstantDone();
    expect(component.getPercent(component.dictionary)).toBe(100);
  });

  it('getPercent returns correct percentage during loading', fakeAsync(() => {
    component.trackVoice(Promise.resolve(true));
    component.trackVoice(new Promise(() => {}));
    tick();
    expect(component.getPercent(component.voices)).toBe(50);
  }));
});
