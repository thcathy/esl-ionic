import {Injectable} from '@angular/core';

import {SentenceHistory} from '../../entity/sentence-history';
import {ValidationUtils} from '../../utils/validation-utils';
import {NGXLogger} from 'ngx-logger';

namespace ArticleDictationService {
  export interface CheckAnswerOptions {
    caseSensitive?: boolean;
    checkPunctuation?: boolean;
  }

}

@Injectable(
  { providedIn: 'root' }
)
export class ArticleDictationService {

  constructor (
    private log: NGXLogger,
  ) {
  }

  sentenceLengthOptionsToValue(option: string): number {
    if (option === 'Short') {
      return 3;
    } else if (option === 'Long') {
      return 7;
    } else if (option === 'VeryLong') {
      return 10;
    } else {
      return 5;
    }
  }

  divideToSentences(article: string, maxWordsInSentence: number = 5): string[] {
    if (article == null || article.length < 1) { return []; }

    return article.split('\n')
      .map((s) => s.replace(/\t/g, ''))
      .map((s) => s.trim())
      .flatMap((s) => this.splitBySentenceEnding(s))
      .flatMap((s) => this.splitLongSentenceByWords(s, maxWordsInSentence))
      .filter((s) => !ValidationUtils.isBlankString(s));
  }

  splitBySentenceEnding(input: string): string[] {
    if (!input || input.trim().length === 0) { return []; }

    const sentences = input.split(/(?<=[.?!])\s+/);
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  splitLongSentenceByWords(input: string, maxWords: number): string[] {
    const words = input.split(' ').filter((w) => w.length > 0);

    if (words.length <= maxWords) {
      return [input];
    }

    return this.splitLongLineBySpace(input, maxWords);
  }

  splitLongLineBySpace(input: string, maxWordsInSentence: number): string[] {
    const whitespace = ' ';
    const strings = input.split(whitespace);

    if (strings.length <= maxWordsInSentence) {
      return [input];
    }

    const results: string[] = [];
    let endIndex = maxWordsInSentence;
    while (endIndex + maxWordsInSentence <= strings.length) {
      results.push(strings.slice(endIndex - maxWordsInSentence, endIndex).join(whitespace));
      endIndex += maxWordsInSentence;
    }
    if (endIndex === strings.length) {
      results.push(strings.slice(endIndex - maxWordsInSentence, endIndex).join(whitespace));
    } else {
      // evenly split the last two sentences
      const startIndex = endIndex - maxWordsInSentence;
      endIndex = startIndex + Math.ceil((strings.length - startIndex) / 2);
      results.push(strings.slice(startIndex, endIndex).join(whitespace));
      results.push(strings.slice(endIndex, strings.length).join(whitespace));
    }

    return results;
  }



  splitSentence(sentence: string): string[] { return sentence.split(/\b/).filter(s => !ValidationUtils.isBlankString(s)); }

  extractCharacters(input: string, options: ArticleDictationService.CheckAnswerOptions): string {
    if (ValidationUtils.noAlphabet(input)) {
      return options.checkPunctuation? ValidationUtils.punctuationOnly(input) : '';
    } else {
      return options.caseSensitive ? ValidationUtils.alphabetOnly(input) : ValidationUtils.alphabetOnlyToLowerCase(input);
    }
  }

  checkAnswer(question: string, answer: string, options: ArticleDictationService.CheckAnswerOptions): SentenceHistory {
    this.log.debug(`check question [${question}] with answer [${answer}]`);
    const questionSegments = this.splitSentence(question);
    const answerSegments = this.splitSentence(answer);
    const isCorrect: boolean[] =   [];

    let answerPosition = 0;
    for (let questionPosition = 0; questionPosition < questionSegments.length; questionPosition++) {
      let correct = false;
      // no more answer
      if (answerPosition >= answerSegments.length) {
        isCorrect.push(correct);
        continue;
      }

      let questionAlphabet = this.extractCharacters(questionSegments[questionPosition], options);
      let answerAlphabet = this.extractCharacters(answerSegments[answerPosition], options);

      if (ValidationUtils.isBlankString(questionAlphabet)) {
        correct = true;
      } else {
        for (let i = answerPosition; i < answerSegments.length; i++) {
          const subAnswerAlphabet = this.extractCharacters(answerSegments[i], options);
          if (ValidationUtils.wordEqual(questionAlphabet, subAnswerAlphabet)) {
            correct = true;
            answerPosition = i - 1;
            break;
          }
        }
      }

      if (this.questionAndAnsNotBlank(questionAlphabet, answerAlphabet)
        || this.questionAndAnsBlank(questionAlphabet, answerAlphabet)) {
        if (correct || !this.answerSizeLeftIsSmaller(questionPosition, questionSegments.length, answerPosition, answerSegments.length)) {
          answerPosition++;
        }
      }

      isCorrect.push(correct);
    }

    this.log.debug(`compare result: segments ${questionSegments.join()}`);
    this.log.debug(`compare result: isCorrect ${isCorrect}`);

    return <SentenceHistory>{
      question: question,
      answer: answer,
      questionSegments: questionSegments,
      isCorrect: isCorrect
    };
  }

  private questionAndAnsNotBlank(questionAlphabet: string, answerAlphabet: string): boolean {
    return !ValidationUtils.isBlankString(questionAlphabet) && !ValidationUtils.isBlankString(answerAlphabet);
  }

  private questionAndAnsBlank(questionAlphabet: string, answerAlphabet: string): boolean {
    return ValidationUtils.isBlankString(questionAlphabet) && ValidationUtils.isBlankString(answerAlphabet);
  }

  private answerSizeLeftIsSmaller(questionPosition: number, questionSize: number, answerPosition: number, ansSize: number): boolean {
    return (ansSize - answerPosition) < (questionSize - questionPosition);
  }

  public replacePunctuationToWord(
    input: string,
    options: { speakPunctuation?: boolean; } = { speakPunctuation: true, }
  ): string {
    if (!options?.speakPunctuation) {
      return input;
    }

    input = input.replace(/,/g, ', comma,');
    input = input.replace(/\.{3,}|…/g, ', ellipsis,');
    input = input.replace(/\./g, ', full stop,');
    input = input.replace(/\?/g, ', question mark,');
    input = input.replace(/!/g, ', exclamation mark,');
    input = input.replace(/:/g, ', colon,');
    input = input.replace(/;/g, ', semicolon,');
    input = input.replace(/\(/g, ', open round bracket,');
    input = input.replace(/\)/g, ', close round bracket,');
    input = input.replace(/\[/g, ', open square bracket,');
    input = input.replace(/]/g, ', close square bracket,');
    input = input.replace(/\//g, ', slash,');
    input = input.replace(/"|“|”/g, ', double quote,');

    if (options?.speakPunctuation) {
      input = input.replace(/-|—/g, ', hyphen,');
    }

    // Only "speak" apostrophes that are NOT between two alphanumeric characters.
    input = input.replace(/['’‘]/g, (match, offset, whole: string) => {
      const prev = offset > 0 ? whole[offset - 1] : '';
      const next = offset + 1 < whole.length ? whole[offset + 1] : '';
      const prevIsAlphaNum = /[A-Za-z0-9]/.test(prev);
      const nextIsAlphaNum = /[A-Za-z0-9]/.test(next);
      return (prevIsAlphaNum && nextIsAlphaNum) ? match : ', apostrophe,';
    });

    // Normalize spacing/gluing introduced by ", <token>," replacements:
    // - remove empty tokens caused by adjacent replacements (e.g. ellipsis + quote -> ",,")
    // - collapse whitespace inside tokens
    // - join with consistent ", " for better TTS
    const tokens = input
      .split(',')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter((s) => s.length > 0);
    return tokens.join(', ');
  }
}
