import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CharacterComponent } from './character.component';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('CharacterComponent', () => {
  let component: CharacterComponent;
  let fixture: ComponentFixture<CharacterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterComponent ],
      imports: [IonicModule.forRoot(), NoopAnimationsModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('if and only if character is underscore, it is blinking', () => {
    component.character = '_';
    fixture.detectChanges();

    expect(component.isBlink).toBeTrue();
    const span = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(span.classList.contains('blinking')).toBeTrue();

    component.character = 'a';
    fixture.detectChanges();
    expect(component.isBlink).toBeFalse();
    expect(span.classList.contains('blinking')).toBeFalse();
  });
});
