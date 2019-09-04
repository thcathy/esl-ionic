import {Injectable} from '@angular/core';

import {SentenceHistory} from '../../entity/sentence-history';
import {environment} from '../../../environments/environment';
import {ValidationUtils} from '../../utils/validation-utils';
import {NGXLogger} from 'ngx-logger';

@Injectable(
  { providedIn: 'root' }
)
export class ArticleDictationService {

  public maxSentenceLength = environment.maxSentenceLength;

  constructor (
    private log: NGXLogger,
  ) {
  }

  divideToSentences(article: string, maxWordsInSentence: number = 5): string[] {
    if (article == null || article.length < 1) { return []; }

    return article.split('\n')
      .map((s) => s.split('\t').join(''))
      .map((s) => s.trim())
      .map((s) => this.splitLongLineByFullstop(s)).reduce((a, b) => a.concat(b), [])
      .map((s) => this.splitLongLingByComma(s)).reduce((a, b) => a.concat(b), [])
      .map((s) => this.splitLongLineBySpace(s, maxWordsInSentence)).reduce((a, b) => a.concat(b), [])
      .filter((s) => !ValidationUtils.isBlankString(s));
  }

  splitLongLineBySpace(input: string, maxWordsInSentence: number): string[] {
    if (input.length < this.maxSentenceLength) {
      return [input];
    }

    const results: string[] = [];
    while (input.length > this.maxSentenceLength) {
      const spacePos = input.indexOf(' ', this.maxSentenceLength);
      if (spacePos < 0) {
        break;
      }

      results.push(input.substring(0, spacePos).trim());
      input = input.substring(spacePos);
    }
    if (input.length > 0) { results.push(input.trim()); }

    return results;
  }


  splitLongLineByFullstop(input: string): string[] {
    if (input.length < this.maxSentenceLength) {
      return [input];
    }
    else {
      return input.split('. ')
              .map((s) => s.endsWith('.') ? s : s + '.')
              .filter((s) => s.match('.*[a-zA-Z]+.*'))
              .map((s) => s.trim());
    }
  }

  splitLongLingByComma(input: string): string[] {
    if (input.length < this.maxSentenceLength) {
      return [input];
    }

    let results: string[] = [];
    while (input.length > this.maxSentenceLength - 10) {
      const commaPos = input.indexOf(',', this.maxSentenceLength - 10);
      if (commaPos < 0) {
        results.push(input);
        break;
      }
      results.push(input.substring(0, commaPos));
      input = input.substring(commaPos);
    }

    return results;
  }

  checkAnswer(question: string, answer: string): SentenceHistory {
    this.log.debug(`check question [${question}] with answer [${answer}]`);
    const questionSegments = question.split(' ');
    const answerSegments = answer.split(' ');
    const isCorrect: boolean[] = [];

    let answerPosition = 0;
    for (let questionPosition = 0; questionPosition < questionSegments.length; questionPosition++) {
      let correct = false;
      // no more answer
      if (answerPosition >= answerSegments.length) {
        isCorrect.push(correct);
        continue;
      }

      const questionSegment = questionSegments[questionPosition];
      const questionAlphabet = ValidationUtils.alphabetOnly(questionSegment);
      const answerAlphabet = ValidationUtils.alphabetOnly(answerSegments[answerPosition]);

      if (ValidationUtils.isBlankString(questionAlphabet)) {
        correct = true;
      }
      else {
        for (let i = answerPosition; i < answerSegments.length; i++) {
          const subAnswerAlphabet = ValidationUtils.alphabetOnly(answerSegments[i]);
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
}
