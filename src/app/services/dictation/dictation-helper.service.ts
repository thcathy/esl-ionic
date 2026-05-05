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

  toCopyDraft(dictation: Dictation): Dictation {
    const options: Dictations.Options | undefined = dictation.options
      ? {
          practiceType: dictation.options.practiceType,
          voiceMode: dictation.options.voiceMode,
          caseSensitiveSentence: dictation.options.caseSensitiveSentence,
          checkPunctuation: dictation.options.checkPunctuation,
          speakPunctuation: dictation.options.speakPunctuation,
          retryWrongWord: dictation.options.retryWrongWord,
        }
      : undefined;

    return {
      id: -1,
      title: dictation.title,
      description: dictation.description,
      suitableStudent: dictation.suitableStudent,
      source: dictation.source,
      article: dictation.article,
      sentenceLength: dictation.sentenceLength,
      showImage: dictation.showImage,
      includeAIImage: dictation.includeAIImage,
      wordContainSpace: dictation.wordContainSpace,
      vocabs: dictation.vocabs?.map(vocab => ({...vocab})),
      options: options,
    };
  }

  wordsToPractice(dictation: Dictation): string[] {
    return dictation.options?.retryWrongWord ?
      (dictation.options.vocabPracticeHistories ?? [])
        .filter(h => !h.correct)
        .map(h => h.question.word)
      : (dictation.vocabs ?? []).map(v => v.word);
  }
}
