import {Injectable} from '@angular/core';

import {SentenceHistory} from '../../entity/sentence-history';
import {environment} from '../../../environments/environment';
import {ValidationUtils} from '../../utils/validation-utils';
import {NGXLogger} from 'ngx-logger';
import {SentenceLengthOptions} from '../../entity/dictation';

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

  public maxSentenceLength = environment.maxSentenceLength;

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
      .map((s) => s.split('\t').join(''))
      .map((s) => s.trim())
      .map((s) => this.splitLongLineByFullstop(s)).reduce((a, b) => a.concat(b), [])
      .map((s) => this.splitLongLineBySpace(s, maxWordsInSentence)).reduce((a, b) => a.concat(b), [])
      .filter((s) => !ValidationUtils.isBlankString(s));
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


  splitLongLineByFullstop(input: string): string[] {
    if (input.length < this.maxSentenceLength) {
      return [input];
    } else {
      return input.split('. ')
              .map((s) => s.endsWith('.') ? s : s + '.')
              .filter((s) => s.match('.*[a-zA-Z]+.*'))
              .map((s) => s.trim());
    }
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

  public replacePunctuationToWord(input: string): string {
    input = input.replace(/\,/g, ', comma,');
    input = input.replace(/\.{3,}|…/g, ', ellipsis,');
    input = input.replace(/\./g, ', full stop,');
    input = input.replace(/\?/g, ', question mark,');
    input = input.replace(/\!/g, ', exclamation mark,');
    input = input.replace(/\:/g, ', colon,');
    input = input.replace(/\;/g, ', semicolon,');
    input = input.replace(/\-|—/g, ', hyphen,');
    input = input.replace(/\(/g, ', open round bracket,');
    input = input.replace(/\)/g, ', close round bracket,');
    input = input.replace(/\[/g, ', open square bracket,');
    input = input.replace(/\]/g, ', close square bracket,');
    input = input.replace(/\//g, ', slash,');
    input = input.replace(/\'|’|‘/g, ', apostrophe,');
    input = input.replace(/"|“|”/g, ', double quote,');
    return input;
  }
}
