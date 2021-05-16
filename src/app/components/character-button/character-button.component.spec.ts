import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CharacterButtonComponent } from './character-button.component';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('CharacterButtonComponent', () => {
  let component: CharacterButtonComponent;
  let fixture: ComponentFixture<CharacterButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterButtonComponent ],
      imports: [
        SharedTestModule.forRoot(),
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('click correct button twice only emit event once', () => {
    spyOn(component.correctPress, 'emit');
    component.isCorrect = true;
    component.onClick();
    component.onClick();
    fixture.detectChanges();
    expect(component.correctPress.emit).toHaveBeenCalledTimes(1);
  });

  it('click correct button', () => {
    component.isCorrect = true;
    component.onClick();
    expect(component.state).toEqual('correct');
  });

  it('click wrong button', () => {
    component.isCorrect = false;
    component.onClick();
    expect(component.state).toEqual('wrong');
  });
});
