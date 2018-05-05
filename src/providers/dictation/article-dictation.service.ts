import {Injectable} from '@angular/core';

import {ENV} from "../../environment/environment.prod";


@Injectable()
export class ArticleDictationService {

  public maxSentenceLength = ENV.maxSentenceLength;

  constructor () {
  }

  divideToSentences(article: string): string[] {
    if (article == null || article.length < 1) return [];

    return article.split("\n")
      .map((s) => s.split("\t").join(""))
      .map((s) => s.trim())
      .map((s) => this.splitLongLineByFullstop(s)).reduce((a, b) => a.concat(b), [])
      .map((s) => this.splitLongLingByComma(s)).reduce((a, b) => a.concat(b), [])
      .map((s) => this.splitLongLineBySpace(s)).reduce((a, b) => a.concat(b), [])
      .filter((s) => !s || s.length > 0);
  }

  splitLongLineBySpace(input: string): string[] {
    if (input.length < this.maxSentenceLength)
      return [input];
    console.info(`Split long sentence space: ${input}`);

    const results: string[] = [];
    while (input.length > this.maxSentenceLength) {
      const spacePos = input.indexOf(' ', this.maxSentenceLength);
      if (spacePos < 0)
        break;

      results.push(input.substring(0, spacePos).trim());
      input = input.substring(spacePos);
    }
    if (input.length > 0) results.push(input.trim());

    return results;
  }


  splitLongLineByFullstop(input: string): string[] {
    if (input.length < this.maxSentenceLength)
      return [input];
    else
      return input.split(". ")
              .map((s) => s.endsWith(".") ? s : s + ".")
              .filter((s) => s.match(".*[a-zA-Z]+.*"))
              .map((s) => s.trim());
  }

  splitLongLingByComma(input: string): string[] {
    if (input.length < this.maxSentenceLength)
      return [input];
    console.log(`Split long sentence by comma: ${input}`);

    var results: string[] = [];
    while (input.length > this.maxSentenceLength - 10) {
      const commaPos = input.indexOf(',', this.maxSentenceLength-10);
      if (commaPos < 0) {
        results.push(input);
        break;
      }
      results.push(input.substring(0, commaPos));
      input = input.substring(commaPos);
    }

    return results
  }
}
