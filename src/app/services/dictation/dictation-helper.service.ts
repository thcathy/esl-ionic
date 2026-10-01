import {Injectable} from '@angular/core';
import {Dictation, Dictations} from '../../entity/dictation';
import {Vocab} from '../../entity/vocab';
import {ValidationUtils} from '../../utils/validation-utils';

@Injectable({ providedIn: 'root' })
export class DictationHelper {

  constructor () {}

  isInstantDictation(dictation: Dictation): boolean {
    return dictation.id < 0;
  }

  /**
   * Word vs Sentence.
   * Server type Vocab or Article wins. Objects built in the app, which have no type, use article text.
   */
  isSentenceDictation(dictation: Dictation): boolean {
    if (dictation.type === 'Article') {
      return true;
    }
    if (dictation.type === 'Vocab') {
      return false;
    }
    return !ValidationUtils.isBlankString(dictation.article);
  }

  /**
   * One line for a list row. Description wins. Otherwise vocab words or article text.
   * CSS ellipsizes; this string is not cut to a word count and has no ellipsis.
   */
  previewLine(dictation: Dictation): string {
    const description = (dictation.description ?? '').trim();
    if (description.length > 0) {
      return description;
    }
    if (this.isSentenceDictation(dictation)) {
      return (dictation.article ?? '').trim().replace(/\s+/g, ' ');
    }
    return this.vocabPreview(dictation.vocabs);
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

  private vocabPreview(vocabs: Vocab[] | undefined): string {
    return (vocabs ?? [])
      .map((vocab) => (vocab.word ?? '').trim())
      .filter((word) => word.length > 0)
      .join(', ');
  }
}
