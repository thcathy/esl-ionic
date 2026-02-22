import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {VocabPracticeTypeModalComponent} from './vocab-practice-type-modal.component';

describe('VocabPracticeTypeModalComponent', () => {
  let component: VocabPracticeTypeModalComponent;
  let fixture: ComponentFixture<VocabPracticeTypeModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VocabPracticeTypeModalComponent],
      imports: [SharedTestModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabPracticeTypeModalComponent);
    component = fixture.componentInstance;
    component.modal = jasmine.createSpyObj('IonModal', ['present', 'dismiss']) as any;
  });

  it('open sets selected type and presents modal', () => {
    component.open(VocabPracticeType.Puzzle);
    expect(component.selectedType).toEqual(VocabPracticeType.Puzzle);
    expect(component.modal.present).toHaveBeenCalled();
  });

  it('start dismisses modal and emits selected type', () => {
    spyOn(component.confirmed, 'emit');
    component.selectedType = VocabPracticeType.Spell;

    component.start();

    expect(component.modal.dismiss).toHaveBeenCalled();
    expect(component.confirmed.emit).toHaveBeenCalledWith(VocabPracticeType.Spell);
  });
});
