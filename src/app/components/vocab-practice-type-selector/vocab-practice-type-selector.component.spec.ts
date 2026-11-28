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
    expect(text).toContain('Practice Method');
    expect(text).toContain('Spelling');
    expect(text).toContain('Puzzle');
    expect(text).toContain('Write on paper');
    expect(text).toContain('Listen, write on paper, then check your answers.');
    expect(text).not.toContain('Auto play next');
  });

  it('shows Write on paper playback options only while that type is selected', () => {
    component.selectedType = VocabPracticeType.Paper;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Auto play next');
    expect(text).toContain('Repeat');
    expect(text).not.toContain('Pause');
    expect(text).not.toContain('Used when Auto play next is on.');
  });

  it('shows Pause only after Auto play next is turned on', () => {
    component.selectedType = VocabPracticeType.Paper;
    component.autoPlayNext = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pause');
    expect(fixture.nativeElement.querySelectorAll('.type-example').length).toBe(3);
  });

  it('keeps Write on paper when the selection changes', () => {
    fixture.detectChanges();
    spyOn(component.selectedTypeChange, 'emit');

    component.onSelectedTypeChange(VocabPracticeType.Paper);

    expect(component.selectedType).toBe(VocabPracticeType.Paper);
    expect(component.selectedTypeChange.emit).toHaveBeenCalledWith(VocabPracticeType.Paper);
  });

  it('copies playback settings only while Write on paper is selected', () => {
    const options: { autoPlayNext?: boolean; repeatCount?: number; speakRate?: number; pauseSeconds?: number } = {};
    component.selectedType = VocabPracticeType.Spell;
    component.autoPlayNext = true;
    component.applyPaperPlayback(options);
    expect(options.autoPlayNext).toBeFalse();

    component.selectedType = VocabPracticeType.Paper;
    component.repeatCount = 3;
    component.speed = 0.4;
    component.pauseSeconds = 8;
    component.applyPaperPlayback(options);

    expect(options.autoPlayNext).toBeTrue();
    expect(options.repeatCount).toBe(3);
    expect(options.speakRate).toBe(0.4);
    expect(options.pauseSeconds).toBe(8);
  });
});
