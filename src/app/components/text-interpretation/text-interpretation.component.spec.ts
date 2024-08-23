import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TextInterpretationComponent} from './text-interpretation.component';
import {InterpretationService} from "../../services/practice/interpretation.service";
import {By} from "@angular/platform-browser";
import {SharedTestModule} from "../../../testing/shared-test.module";
import {of} from "rxjs";
import {SimpleChange} from "@angular/core";

describe('TextInterpretationComponent', () => {
  let component: TextInterpretationComponent;
  let fixture: ComponentFixture<TextInterpretationComponent>;
  let interpretationService: jasmine.SpyObj<InterpretationService>;

  beforeEach(async () => {
    const interpretSpy = jasmine.createSpyObj('InterpretationService', ['interpret', 'isEN']);

    await TestBed.configureTestingModule({
      declarations: [TextInterpretationComponent],
      imports: [SharedTestModule.forRoot()],
      providers: [
        { provide: InterpretationService, useValue: interpretSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextInterpretationComponent);
    component = fixture.componentInstance;
    interpretationService = TestBed.inject(InterpretationService) as jasmine.SpyObj<InterpretationService>;
  });

  it('should display loading dots when translatedText is empty', () => {
    fixture.detectChanges(); // Initial binding
    const dots = fixture.debugElement.queryAll(By.css('.dot'));
    expect(dots.length).toBe(5);
  });

  it('should display translated text when enabled and text is translated', () => {
    component.enabled = true;
    const translatedText = 'Translated text';
    interpretationService.interpret.and.returnValue(of(translatedText)); // Mock the service call

    const simpleChange = new SimpleChange(null, 'New text', true);
    component.ngOnChanges({ text: simpleChange });
    fixture.detectChanges(); // Update the view

    expect(component.translatedText).toBe(translatedText); // Check the updated translation
    const displayedText = fixture.debugElement.query(By.css('span:last-child')).nativeElement.textContent.trim();
    expect(displayedText).toBe(translatedText); // Verify the displayed text
  });

  it('should display "-" when toggle is off', () => {
    component.enabled = false; // Set toggle to off
    component.translatedText = 'hello'; // Ensure translatedText is empty
    fixture.detectChanges(); // Update the view

    const displayedText = fixture.debugElement.query(By.css('span:last-child')).nativeElement.textContent.trim();
    expect(displayedText).toBe('-'); // Verify the displayed text is '-'
  });
});
