import {ArticleDictationService} from './article-dictation.service';
import {ValidationUtils} from '../../utils/validation-utils';
import {NGXLoggerSpy} from '../../../testing/mocks-ionic';

describe('ArticleDictationService', () => {
  let service: ArticleDictationService;

  beforeEach(() => {
    service = new ArticleDictationService(NGXLoggerSpy());
    service.maxSentenceLength = 40;
  });

  it('separate sentence with different maxWordsInSentence = 3', () => {
    const article =
      `Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School in Blackpool, was a "bubbly, kind, welcoming, funny, generous" colleague, the school's principal has said.
      Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague".
      She added: "Our thoughts are with her friends and family at this terrible time."`;

    const sentences = service.divideToSentences(article, 3);
    let i = 0;
    expect(sentences[i++]).toBe('Victim Jane Tweddle-Taylor,');
    expect(sentences[i++]).toBe('a receptionist at');
    expect(sentences[i++]).toBe('South Shore Academy');
    expect(sentences[i++]).toBe('School in Blackpool,');
    expect(sentences[i++]).toBe(`was a "bubbly,`);
    expect(sentences[i++]).toBe(`kind, welcoming, funny,`);
    expect(sentences[i++]).toBe(`generous" colleague, the`);
    expect(sentences[i++]).toBe(`school's principal`);
    expect(sentences[i++]).toBe(`has said.`);
    expect(sentences[i++]).toBe('Jane Bailey described');
    expect(sentences[i++]).toBe('Miss Tweddle-Taylor, 51,');
    expect(sentences[i++]).toBe('as a "well-loved');
    expect(sentences[i++]).toBe('member of staff"');
    expect(sentences[i++]).toBe('and "wonderful friend');
    expect(sentences[i++]).toBe('and colleague".');
    expect(sentences[i++]).toBe('She added: "Our');
    expect(sentences[i++]).toBe('thoughts are with');
    expect(sentences[i++]).toBe('her friends and');
    expect(sentences[i++]).toBe('family at this');
    expect(sentences[i++]).toBe('terrible time.".');
  });

  it('separate sentence with different maxWordsInSentence = 5', () => {
    const article =
      `Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School in Blackpool, was a "bubbly, kind, welcoming, funny, generous" colleague, the school's principal has said.
      Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague".
      She added: "Our thoughts are with her friends and family at this terrible time."`;

    const sentences = service.divideToSentences(article, 5);
    let i = 0;
    expect(sentences[i++]).toBe('Victim Jane Tweddle-Taylor, a receptionist');
    expect(sentences[i++]).toBe('at South Shore Academy School');
    expect(sentences[i++]).toBe('in Blackpool, was a "bubbly,');
    expect(sentences[i++]).toBe(`kind, welcoming, funny, generous" colleague,`);
    expect(sentences[i++]).toBe(`the school's principal has said.`);
    expect(sentences[i++]).toBe('Jane Bailey described Miss Tweddle-Taylor,');
    expect(sentences[i++]).toBe('51, as a "well-loved member');
    expect(sentences[i++]).toBe('of staff" and "wonderful');
    expect(sentences[i++]).toBe('friend and colleague".');
    expect(sentences[i++]).toBe('She added: "Our thoughts are');
    expect(sentences[i++]).toBe('with her friends and family');
    expect(sentences[i++]).toBe('at this terrible time.".');
  });

  it('separate sentence with different maxWordsInSentence = 7', () => {
    const article =
      `Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School in Blackpool, was a "bubbly, kind, welcoming, funny, generous" colleague, the school's principal has said.
      Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague".
      She added: "Our thoughts are with her friends and family at this terrible time."`;

    const sentences = service.divideToSentences(article, 7);
    let i = 0;
    expect(sentences[i++]).toBe('Victim Jane Tweddle-Taylor, a receptionist at South');
    expect(sentences[i++]).toBe('Shore Academy School in Blackpool, was a');
    expect(sentences[i++]).toBe('"bubbly, kind, welcoming, funny, generous" colleague,');
    expect(sentences[i++]).toBe(`the school's principal has said.`);
    expect(sentences[i++]).toBe('Jane Bailey described Miss Tweddle-Taylor, 51, as');
    expect(sentences[i++]).toBe('a "well-loved member of staff"');
    expect(sentences[i++]).toBe('and "wonderful friend and colleague".');
    expect(sentences[i++]).toBe('She added: "Our thoughts are with her');
    expect(sentences[i++]).toBe('friends and family at this terrible time.".');
  });

  it('separate sentence with different maxWordsInSentence = 10', () => {
    const article =
      `Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School in Blackpool, was a "bubbly, kind, welcoming, funny, generous" colleague, the school's principal has said.
      Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague".
      She added: "Our thoughts are with her friends and family at this terrible time."`;

    const sentences = service.divideToSentences(article, 10);
    let i = 0;
    expect(sentences[i++]).toBe('Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School');
    expect(sentences[i++]).toBe('in Blackpool, was a "bubbly, kind, welcoming, funny,');
    expect(sentences[i++]).toBe(`generous" colleague, the school's principal has said.`);
    expect(sentences[i++]).toBe(`Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved`);
    expect(sentences[i++]).toBe(`member of staff" and "wonderful friend and colleague".`);
    expect(sentences[i++]).toBe('She added: "Our thoughts are with her');
    expect(sentences[i++]).toBe('friends and family at this terrible time.".');
  });

  it('separate sentence with 7 words per sentence', () => {
    const article = `A zoo-keeper who died after a tiger entered an enclosure at a wildlife park in Cambridgeshire has been named as 33-year-old Rosa King.
    The death happened at Hamerton Zoo Park, near Huntingdon, at about 11:15 BST on Monday.
      Friend Garry Chisholm, a wildlife photographer in his spare time, said she was the "focal point" and "shining light" of the wildlife park.
      The zoo said it was a freak accident, and police said it was not suspicious.
      Mr Chisholm, 59, of Irchester, Northamptonshire, said the wildlife park revolved around the zoo-keeper.`;

    const sentences = service.divideToSentences(article);
    let i = 0;
    expect(sentences[i++]).toBe('A zoo-keeper who died after');
    expect(sentences[i++]).toBe('a tiger entered an enclosure');
    expect(sentences[i++]).toBe('at a wildlife park in');
    expect(sentences[i++]).toBe('Cambridgeshire has been named');
    expect(sentences[i++]).toBe('as 33-year-old Rosa King.');
    expect(sentences[i++]).toBe(`The death happened at Hamerton`);
    expect(sentences[i++]).toBe('Zoo Park, near Huntingdon, at');
    expect(sentences[i++]).toBe('about 11:15 BST on Monday.');
  });

  it('No sentence is empty', () => {
    const article = `Alerts are a great way to offer the user the ability to choose a specific action or list of actions.
    They also can provide the user with important information, or require them to make a decision (or multiple decisions).

From a UI perspective, Alerts can be thought of as`;

    const sentences = service.divideToSentences(article);
    console.log(`divided: ${sentences}`);
    const allIsNotEmpty = sentences.every((s) => !ValidationUtils.isBlankString(s));
    expect(allIsNotEmpty).toBe(true);
  });

  it('checkAnswer in different cases', () => {
    const question = `Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague".`;
    const testcases = [
      {
        answer: `Jane Bailey described Miss Tweddle-Taylor, 51, as a well-loved member of staff and wonderful friend and colleague.`,
        result: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
      },
      {
        answer: `Bailey described Miss Tweddle-Taylor, 51, as a well-loved member of staff and wonderful friend and colleague.`,
        result: [false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
      },
      {
        answer: `Tweddle-Taylor member`,
        result: [false, false, false, false, true, true, false, false, false, true, false, false, false, false, false, false, false]
      },
      {
        answer: `abc Tweddle-Taylor member`,
        result: [false, false, false, false, true, true, false, false, false, true, false, false, false, false, false, false, false]
      },
      {
        answer: `abc bailey described as a well lived member of staff and wonderful friend and colleague`,
        result: [false, true, true, false, false, true, true, true, false, true, true, true, true, true, true, true, true]
      },
      {
        answer: `Jane Bailey described Miss Tweddle-Taylor, five one, as a well-loved member of staff and wonderful friend and colleague.`,
        result: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
      }
    ];

    testcases.forEach((t) => {
      const history = service.checkAnswer(question, t.answer);
      expect(compare(t.result, history.isCorrect)).toBe(true);
    });
  });

});

function compare(arr1: boolean[], arr2: boolean[]) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}
