import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {UIOptionsService} from '../../services/ui-options.service';
import {VoiceModeSelectorComponent} from './voice-mode-selector.component';

describe('VoiceModeSelectorComponent', () => {
  let component: VoiceModeSelectorComponent;
  let fixture: ComponentFixture<VoiceModeSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VoiceModeSelectorComponent],
      imports: [SharedTestModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceModeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('normalize invalid mode to online', () => {
    component.onSelectedModeChange('invalid');
    expect(component.selectedMode).toBe(UIOptionsService.voiceMode.online);
  });

  it('emit selected local mode', () => {
    spyOn(component.selectedModeChange, 'emit');
    component.onSelectedModeChange(UIOptionsService.voiceMode.local);
    expect(component.selectedMode).toBe(UIOptionsService.voiceMode.local);
    expect(component.selectedModeChange.emit).toHaveBeenCalledWith(UIOptionsService.voiceMode.local);
  });
});
