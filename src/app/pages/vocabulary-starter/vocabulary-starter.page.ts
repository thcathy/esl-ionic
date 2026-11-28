import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {vocabDifficulties, VocabDifficulty} from '../../entity/voacb-practice';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {FFSAuthService} from '../../services/auth.service';
import {resolveVocabPracticeType, VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {StorageService} from '../../services/storage.service';
import {TranslateService} from "@ngx-translate/core";
import {UIOptionsService} from '../../services/ui-options.service';
import {VocabPracticeTypeSelectorComponent} from '../../components/vocab-practice-type-selector/vocab-practice-type-selector.component';

@Component({
    selector: 'app-vocabulary-starter',
    templateUrl: './vocabulary-starter.page.html',
    styleUrls: ['./vocabulary-starter.page.scss'],
    standalone: false
})
export class VocabularyStarterPage implements OnInit {
  @ViewChild(VocabPracticeTypeSelectorComponent) practiceTypeSelector?: VocabPracticeTypeSelectorComponent;

  inputKey = 'VocabularyStarterPage.vocabularyStarterPageInput';
  inputForm: UntypedFormGroup;
  vocabDifficulties: String[] = vocabDifficulties;

  constructor(
    public formBuilder: UntypedFormBuilder,
    public vocabPracticeService: VocabPracticeService,
    public navigationService: NavigationService,
    public route: ActivatedRoute,
    public authService: FFSAuthService,
    public storage: StorageService,
    public translate: TranslateService,
    public uiOptionsService: UIOptionsService,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ionViewWillEnter() {
    this.setupInput();
  }

  get difficulty() { return this.inputForm.get('difficulty'); }
  get type() { return this.inputForm.get('type'); }
  get voiceMode() { return this.inputForm.get('voiceMode'); }
  get practiceType() { return VocabPracticeType; }

  async setupInput() {
    const input = <VocabularyStarterPageInput> await this.storage.get(this.inputKey);
    if (input?.difficulty !== undefined) { this.difficulty.setValue(input.difficulty); }
    const [savedVoiceMode, savedPracticeType] = await Promise.all([
      this.uiOptionsService.loadOption(UIOptionsService.keys.ttsVoiceMode),
      this.uiOptionsService.loadOption(UIOptionsService.keys.vocabPracticeType),
    ]);
    const rememberedType = savedPracticeType ?? input?.type;
    if (rememberedType !== undefined && rememberedType !== null && rememberedType !== '') {
      this.type.setValue(resolveVocabPracticeType(rememberedType));
    }
    this.voiceMode.setValue(this.resolveVoiceMode(input, savedVoiceMode));
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      difficulty: '',
      type: '',
      voiceMode: UIOptionsService.voiceMode.online,
    });
    this.difficulty.setValue(VocabDifficulty.Beginner);
    this.type.setValue(VocabPracticeType.Spell);
  }

  start() {
    const practiceType = resolveVocabPracticeType(this.type.value);
    this.type.setValue(practiceType);
    this.saveInput();
    this.uiOptionsService.saveOption(UIOptionsService.keys.vocabPracticeType, practiceType);
    this.vocabPracticeService.generatePractice(this.difficulty.value)
      .subscribe(d => {
        d.options = { practiceType };
        this.practiceTypeSelector?.applyPaperPlayback(d.options);
        this.navigationService.startDictation(d);
      });
  }

  saveInput() {
    this.uiOptionsService.saveOption(UIOptionsService.keys.ttsVoiceMode, this.voiceMode.value ?? UIOptionsService.voiceMode.online);
    this.storage.set(this.inputKey, <VocabularyStarterPageInput>{
      difficulty: this.difficulty.value,
      type: this.type.value,
      voiceMode: this.voiceMode.value ?? UIOptionsService.voiceMode.online,
    });
  }

  private resolveVoiceMode(input: VocabularyStarterPageInput | null, savedVoiceMode: string | null | undefined): string {
    return savedVoiceMode ?? input?.voiceMode ?? UIOptionsService.voiceMode.online;
  }
}

export interface VocabularyStarterPageInput {
  difficulty: VocabDifficulty;
  type: VocabPracticeType;
  voiceMode?: string;
}
