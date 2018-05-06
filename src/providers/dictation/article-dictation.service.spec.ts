import {ArticleDictationService} from "./article-dictation.service";

describe('ArticleDictationService', () => {
  let service: ArticleDictationService;

  beforeEach(() => {
    service = new ArticleDictationService();
    service.maxSentenceLength = 40;
  });

  it('separate sentence contain quote after full stop', () => {
    const article = `Victim Jane Tweddle-Taylor, a receptionist at South Shore Academy School in Blackpool, was a "bubbly, kind, welcoming, funny, generous" colleague, the school's principal has said. Jane Bailey described Miss Tweddle-Taylor, 51, as a "well-loved member of staff" and "wonderful friend and colleague". She added: "Our thoughts are with her friends and family at this terrible time."`;

    const sentences = service.divideToSentences(article);
    console.log(`divided: ${sentences}`);

    expect(sentences[0]).toBe('Victim Jane Tweddle-Taylor, a receptionist');
    expect(sentences[1]).toBe('at South Shore Academy School in Blackpool');
    expect(sentences[2]).toBe(', was a "bubbly, kind, welcoming');
    expect(sentences[3]).toBe(`, funny, generous" colleague, the school's`);
    expect(sentences[4]).toBe('principal has said.');
    expect(sentences[5]).toBe('Jane Bailey described Miss Tweddle-Taylor');
    expect(sentences[6]).toBe(', 51, as a "well-loved member of staff" and');
    expect(sentences[7]).toBe('"wonderful friend and colleague".');
    expect(sentences[8]).toBe('She added: "Our thoughts are with her friends');
    expect(sentences[9]).toBe('and family at this terrible time.".');
  });

  it("separate sentence which is too long by comma",() => {
    const article = `A zoo-keeper who died after a tiger entered an enclosure at a wildlife park in Cambridgeshire has been named as 33-year-old Rosa King.
    The death happened at Hamerton Zoo Park, near Huntingdon, at about 11:15 BST on Monday.
      Friend Garry Chisholm, a wildlife photographer in his spare time, said she was the "focal point" and "shining light" of the wildlife park.
      The zoo said it was a freak accident, and police said it was not suspicious.
      Mr Chisholm, 59, of Irchester, Northamptonshire, said the wildlife park revolved around the zoo-keeper.`;

    const sentences = service.divideToSentences(article);
    console.log(`divided: ${sentences}`);

    expect(sentences[0]).toBe('A zoo-keeper who died after a tiger entered');
    expect(sentences[1]).toBe('an enclosure at a wildlife park in Cambridgeshire');
    expect(sentences[2]).toBe('has been named as 33-year-old Rosa King.');
    expect(sentences[3]).toBe(`The death happened at Hamerton Zoo Park`);
    expect(sentences[4]).toBe(', near Huntingdon, at about 11:15 BST on');
    expect(sentences[5]).toBe('Monday.');
  });

  it("checkAnswer in different cases",() => {
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
      expect(compare(t.result,history.isCorrect)).toBe(true);
    });
  });

});

function compare(arr1: boolean[], arr2: boolean[]) {
  return JSON.stringify(arr1)==JSON.stringify(arr2);
}
