import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {CharacterComponent} from './character.component';
import {By} from '@angular/platform-browser';

describe('CharacterComponent', () => {
  let component: CharacterComponent;
  let fixture: ComponentFixture<CharacterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterComponent ],
      imports: [IonicModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterComponent);
    component = fixture.componentInstance;
  });

  function getSpan(): HTMLSpanElement {
    return fixture.debugElement.query(By.css('span')).nativeElement;
  }

  it('underscore renders as current slot with blank text', () => {
    fixture.componentRef.setInput('character', '_');
    fixture.detectChanges();

    expect(component.isBlink).toBeTrue();
    expect(component.isFuture).toBeFalse();
    const span = getSpan();
    expect(span.classList.contains('current-slot')).toBeTrue();
    expect(span.classList.contains('future-slot')).toBeFalse();
    expect(span.classList.contains('filled-slot')).toBeFalse();
    expect(span.textContent.trim()).toBe('');
  });

  it('question mark renders as future slot with blank text', () => {
    fixture.componentRef.setInput('character', '?');
    fixture.detectChanges();

    expect(component.isFuture).toBeTrue();
    expect(component.isBlink).toBeFalse();
    const span = getSpan();
    expect(span.classList.contains('future-slot')).toBeTrue();
    expect(span.classList.contains('current-slot')).toBeFalse();
    expect(span.classList.contains('filled-slot')).toBeFalse();
    expect(span.textContent.trim()).toBe('');
  });

  it('a letter renders as filled slot showing the letter', () => {
    fixture.componentRef.setInput('character', 'a');
    fixture.detectChanges();

    expect(component.isBlink).toBeFalse();
    expect(component.isFuture).toBeFalse();
    const span = getSpan();
    expect(span.classList.contains('filled-slot')).toBeTrue();
    expect(span.classList.contains('current-slot')).toBeFalse();
    expect(span.classList.contains('future-slot')).toBeFalse();
    expect(span.textContent.trim()).toBe('a');
  });

  it('switching from underscore to a letter clears blink state', () => {
    fixture.componentRef.setInput('character', '_');
    fixture.detectChanges();
    expect(component.isBlink).toBeTrue();

    fixture.componentRef.setInput('character', 'b');
    fixture.detectChanges();
    expect(component.isBlink).toBeFalse();
    expect(getSpan().classList.contains('filled-slot')).toBeTrue();
  });
});
