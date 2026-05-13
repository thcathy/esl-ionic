import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {CharacterButtonComponent} from './character-button.component';
import {SharedTestModule} from '../../../testing/shared-test.module';

describe('CharacterButtonComponent', () => {
  let component: CharacterButtonComponent;
  let fixture: ComponentFixture<CharacterButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterButtonComponent ],
      imports: [SharedTestModule.forRoot()],
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

  it('click correct button sets state to correct and emits character', () => {
    const emitSpy = spyOn(component.correctPress, 'emit');
    component.isCorrect = true;
    component.character = 'x';
    component.onClick();
    expect(component.state).toEqual('correct');
    expect(emitSpy).toHaveBeenCalledOnceWith('x');
  });

  it('click wrong button sets state to wrong and does not emit', () => {
    const emitSpy = spyOn(component.correctPress, 'emit');
    component.isCorrect = false;
    component.onClick();
    expect(component.state).toEqual('wrong');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('correct state resets so button can be re-clicked for repeated letters', fakeAsync(() => {
    const emitSpy = spyOn(component.correctPress, 'emit');
    component.isCorrect = true;
    component.character = 'e';

    component.onClick();
    expect(component.state).toEqual('correct');

    tick(400);
    expect(component.state).toEqual('');

    component.onClick();
    expect(emitSpy).toHaveBeenCalledTimes(2);
  }));

  it('wrong state resets after timeout so button is clickable again', fakeAsync(() => {
    component.isCorrect = false;

    component.onClick();
    expect(component.state).toEqual('wrong');

    tick(500);
    expect(component.state).toEqual('');
  }));
});
