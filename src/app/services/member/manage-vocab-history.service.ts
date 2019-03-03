import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Service} from '../root.service';

import {VocabPractice} from '../../entity/voacb-practice';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {Dictation} from '../../entity/dictation';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Storage} from '@ionic/storage';
import {VocabPracticeService} from '../practice/vocab-practice.service';
import {CollectionUtils} from '../../utils/collection-utils';

@Injectable({ providedIn: 'root' })
export class ManageVocabHistoryService extends Service {
  private MEMBER_VOCABULARIES_KEY = 'ManageVocabHistoryService.MEMBER_VOCABULARIES_KEY';

  learntVocabs: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();
  answeredBefore: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();

  constructor (
    private vocabPracticeService: VocabPracticeService,
    private storage: Storage,
  ) {
    super();
    this.storage.get(this.MEMBER_VOCABULARIES_KEY).then(list => {
      if (list != null) { this.classifyVocabulary(list); }
    });
  }

  public classifyVocabulary(vocabularies: MemberVocabulary[]) {
    vocabularies.forEach(vocab => {
      if (this.isLearnt(vocab)) {
        this.learntVocabs.set(vocab.id.word, vocab);
        this.answeredBefore.delete(vocab.id.word);
      } else {
        this.answeredBefore.set(vocab.id.word, vocab);
      }
    });
  }

  private isLearnt(vocab: MemberVocabulary) {
    return vocab.correct >= environment.learntVocabularyMinimumCorrect;
  }

  async loadFromServer() {
    const list = await this.vocabPracticeService.getAllHistory().toPromise();
    this.classifyVocabulary(list);
  }

  public generatePracticeFromAnsweredBefore(): Dictation {
    return this.vocabPracticeService.generatePracticeFromWords(
      this.randomWordsFromBefore(environment.vocabPracticeQuestions)
      );
  }

  public randomWordsFromBefore(length: number): string[] {
    const words = Array.from(this.answeredBefore.values()).map(v => v.id.word);
    return CollectionUtils.randomPick(words, length);
  }

  public clearCache() {
    this.learntVocabs.clear();
    this.answeredBefore.clear();
  }

}
