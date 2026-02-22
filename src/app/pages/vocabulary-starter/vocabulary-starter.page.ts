import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {vocabDifficulties, VocabDifficulty} from '../../entity/voacb-practice';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {FFSAuthService} from '../../services/auth.service';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {StorageService} from '../../services/storage.service';
import {TranslateService} from "@ngx-translate/core";
import {UIOptionsService} from '../../services/ui-options.service';

@Component({
    selector: 'app-vocabulary-starter',
    templateUrl: './vocabulary-starter.page.html',
    styleUrls: ['./vocabulary-starter.page.scss'],
    standalone: false
})
export class VocabularyStarterPage implements OnInit {
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
    if (input?.type !== undefined) { this.type.setValue(input.type); }
    const savedVoiceMode = await this.uiOptionsService.loadOption(UIOptionsService.keys.ttsVoiceMode);
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
    this.saveInput();
    this.vocabPracticeService.generatePractice(this.difficulty.value)
      .subscribe(d => {
        d.options = { practiceType: this.type.value ?? VocabPracticeType.Spell };
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
