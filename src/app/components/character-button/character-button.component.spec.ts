import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CharacterButtonComponent} from './character-button.component';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('CharacterButtonComponent', () => {
  let component: CharacterButtonComponent;
  let fixture: ComponentFixture<CharacterButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterButtonComponent ],
      imports: [
        SharedTestModule.forRoot(),
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterButtonComponent);
    component = fixture.componentInstance;
  });

  it('click correct button twice only emit event once', () => {
    const emitSpy = spyOn(component.correctPress, 'emit');
    component.isCorrect = true;
    component.character = 'a';
    component.onClick();
    component.onClick();
    fixture.detectChanges();
    expect(component.correctPress.emit).toHaveBeenCalledTimes(1);
    expect(emitSpy.calls.mostRecent().args[0]).toEqual('a');
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
