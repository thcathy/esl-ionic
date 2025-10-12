import {Injectable} from '@angular/core';
import {Service} from '../root.service';
import {environment} from '../../../environments/environment';
import {Dictation} from '../../entity/dictation';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {VocabPracticeService} from '../practice/vocab-practice.service';
import {CollectionUtils} from '../../utils/collection-utils';
import {StorageService} from '../storage.service';

@Injectable({ providedIn: 'root' })
export class ManageVocabHistoryService extends Service {
  private MEMBER_VOCABULARIES_KEY = 'ManageVocabHistoryService.MEMBER_VOCABULARIES_KEY';

  learntVocabs: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();
  answeredBefore: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();

  constructor (
    private vocabPracticeService: VocabPracticeService,
    private storage: StorageService,
  ) {
    super();
    this.storage.get(this.MEMBER_VOCABULARIES_KEY).then(list => {
      if (list != null) { this.classifyVocabulary(list); }
    });
  }

  public classifyVocabulary(vocabularies: MemberVocabulary[]) {
    const newLearntVocabs = new Map<string, MemberVocabulary>();
    const newAnsweredBefore = new Map<string, MemberVocabulary>();

    vocabularies.forEach(vocab => {
      if (this.isLearnt(vocab)) {
        newLearntVocabs.set(vocab.id.word, vocab);
      } else {
        newAnsweredBefore.set(vocab.id.word, vocab);
      }
    });

    this.learntVocabs = newLearntVocabs;
    this.answeredBefore = newAnsweredBefore;
  }

  public isLearnt(vocab: MemberVocabulary) {
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

  public findMemberVocabulary(word: string): MemberVocabulary {
    if (this.learntVocabs.has(word)) {
      return this.learntVocabs.get(word);
    } else {
      return this.answeredBefore.get(word);
    }
  }

  public clearCache() {
    this.learntVocabs.clear();
    this.answeredBefore.clear();
  }

}
