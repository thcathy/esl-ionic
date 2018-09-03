import {Injectable} from '@angular/core';

import {Member} from "../entity/member";
import {Dictation} from "../entity/dictation";
import {DictationService} from "./dictation/dictation.service";
import {TranslateService} from "@ngx-translate/core";
import {ArticleDictationService} from "./dictation/article-dictation.service";

@Injectable({ providedIn: 'root' })
export class DisplayService {

  constructor(public dictationService: DictationService,
              public articleDictationService: ArticleDictationService,
              public translate: TranslateService) {
  }

  public displayName(member: Member) : string {
    if (member.name && member.name.lastName)
      return member.name.firstName + ' ' + member.name.lastName;
    else if (member.name && member.name.firstName != null)
      return member.name.firstName;
    else
      return member.emailAddress;
  }

  public totalQuestion(dictation: Dictation) : string {
    if (this.dictationService.isSentenceDictation(dictation)) {
      return this.articleDictationService.divideToSentences(dictation.article).length + ' ' + this.translate.instant('Sentence');
    } else {
      return dictation.vocabs.length + ' ' + this.translate.instant('Vocab(s)');
    }
  }
}