import {Injectable} from '@angular/core';
import {Dictation, Dictations} from '../../entity/dictation';
import {ValidationUtils} from '../../utils/validation-utils';

@Injectable({ providedIn: 'root' })
export class DictationHelper {

  constructor () {}

  isInstantDictation(dictation: Dictation): boolean {
    return dictation.id < 0;
  }

  isSentenceDictation(dictation: Dictation): boolean {
    return !ValidationUtils.isBlankString(dictation.article);
  }

  isSelectVocabExercise(dictation: Dictation): boolean {
    return dictation != null && dictation.source === Dictations.Source.Select;
  }

  isGeneratedDictation(dictation: Dictation): boolean {
    return dictation != null && dictation.source === Dictations.Source.Generate;
  }
}
