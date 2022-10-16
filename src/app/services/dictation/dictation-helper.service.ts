import {Injectable} from '@angular/core';
import { filter, from, map, mergeMap, Observable } from 'rxjs';
import {Dictation, Dictations} from '../../entity/dictation';
import { vocabDifficulties } from '../../entity/voacb-practice';
import { VocabPracticeHistory } from '../../entity/vocab-practice-history';
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

  wordsToPractice(dictation: Dictation): Observable<string> {
    if (dictation.options?.retryWrongWord) {
      return from(dictation.options.vocabPracticeHistories).pipe(
        filter(h => !h.correct),
        map(h => h.question.word)
      );
    } else {
      return from(dictation.vocabs).pipe(map(v => v.word));
    }
  }
}
