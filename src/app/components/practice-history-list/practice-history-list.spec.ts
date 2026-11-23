import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {PracticeHistoryListComponent} from './practice-history-list';

describe('PracticeHistoryListComponent', () => {
  let component: PracticeHistoryListComponent;
  let fixture: ComponentFixture<PracticeHistoryListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeHistoryListComponent);
    component = fixture.componentInstance;
  });

  it('shows Write on paper records in list order without a typed answer', () => {
    component.chronological = true;
    component.mark = 1;
    component.histories = [
      { answer: '', correct: true, question: { word: 'apple' } as any, state: 'in' },
      { answer: '', correct: false, question: { word: 'playground' } as any, state: 'in' },
    ];

    fixture.detectChanges();

    const badges = Array.from(fixture.nativeElement.querySelectorAll('ion-badge'))
      .map((badge: HTMLElement) => badge.textContent.trim());
    expect(badges).toEqual(['1', '2']);
    expect(fixture.nativeElement.textContent).toContain('apple');
    expect(fixture.nativeElement.textContent).toContain('playground');
    expect(fixture.nativeElement.textContent).not.toContain('—');
  });
});
