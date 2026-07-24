import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {VocabImageComponent} from './vocab-image';
import {defaultImage} from '../../entity/dictation';

describe('VocabImageComponent', () => {
  let component: VocabImageComponent;
  let fixture: ComponentFixture<VocabImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabImageComponent ],
      imports: [SharedTestModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabImageComponent);
    component = fixture.componentInstance;
  }));

  it('default image if no images input', () => {
    fixture.componentRef.setInput('images', null);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);

    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);
  });

  it('uses default placeholder when images are missing', () => {
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);
    expect(component.showingPlaceholder).toBeTrue();
  });

  it('shows unverified note for real images when unverified is true', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    fixture.componentRef.setInput('unverified', true);
    fixture.detectChanges();

    expect(component.showUnverifiedNote).toBeTrue();
    expect(fixture.nativeElement.querySelector('.unverified-note-row')).toBeTruthy();
  });

  it('hides unverified note when unverified is false', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg']);
    fixture.componentRef.setInput('unverified', false);
    fixture.detectChanges();

    expect(component.showUnverifiedNote).toBeFalse();
    expect(fixture.nativeElement.querySelector('.unverified-note-row')).toBeNull();
  });

  it('hides unverified note for placeholder even when unverified is true', () => {
    fixture.componentRef.setInput('images', []);
    fixture.componentRef.setInput('unverified', true);
    fixture.detectChanges();

    expect(component.showUnverifiedNote).toBeFalse();
    expect(fixture.nativeElement.querySelector('.unverified-note-row')).toBeNull();
  });

  it('keeps unverified note visible across carousel navigation', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    fixture.componentRef.setInput('unverified', true);
    fixture.detectChanges();
    expect(component.showUnverifiedNote).toBeTrue();

    component.nextImage();
    component.onDone({} as any);
    expect(component.showUnverifiedNote).toBeTrue();

    component.previousImage();
    component.onDone({} as any);
    expect(component.showUnverifiedNote).toBeTrue();
  });

});
