import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {VocabPracticeTypeSelectorComponent} from './vocab-practice-type-selector.component';

describe('VocabPracticeTypeSelectorComponent', () => {
  let component: VocabPracticeTypeSelectorComponent;
  let fixture: ComponentFixture<VocabPracticeTypeSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabPracticeTypeSelectorComponent);
    component = fixture.componentInstance;
  });

  it('lists Spelling, Puzzle, and Write on paper in a vertical list', () => {
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('.practice-type-option');
    const text = fixture.nativeElement.textContent;

    expect(options.length).toBe(3);
    expect(fixture.nativeElement.querySelector('ion-col')).toBeNull();
    expect(text).toContain('Practice method');
    expect(text).toContain('Spelling');
    expect(text).toContain('Puzzle');
    expect(text).toContain('Write on paper');
    expect(text).not.toContain('Listen, write on paper, then tick');
    expect(fixture.nativeElement.querySelector('.type-example')).toBeNull();
    expect(fixture.nativeElement.querySelector('.type-hint')).toBeNull();
  });

  it('keeps Write on paper when the selection changes', () => {
    fixture.detectChanges();
    spyOn(component.selectedTypeChange, 'emit');

    component.onSelectedTypeChange(VocabPracticeType.Paper);

    expect(component.selectedType).toBe(VocabPracticeType.Paper);
    expect(component.selectedTypeChange.emit).toHaveBeenCalledWith(VocabPracticeType.Paper);
  });
});
