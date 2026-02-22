import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {CharacterComponent} from './character.component';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('CharacterComponent', () => {
  let component: CharacterComponent;
  let fixture: ComponentFixture<CharacterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterComponent ],
      imports: [IonicModule.forRoot(), NoopAnimationsModule ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterComponent);
    component = fixture.componentInstance;
  });

  it('if character is underscore, it is blinking', () => {
    fixture.componentRef.setInput('character', '_');
    fixture.detectChanges();

    expect(component.isBlink).toBeTrue();
    const span = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(span.classList.contains('blinking')).toBeTrue();
  });

  it('if character is not underscore, it is not blinking', () => {
    fixture.componentRef.setInput('character', 'a');
    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(component.isBlink).toBeFalse();
    expect(span.classList.contains('blinking')).toBeFalse();
  });
});
