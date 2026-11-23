export enum VocabPracticeType {
  Spell = 'Spell',
  Puzzle = 'Puzzle',
  Paper = 'Paper',
}

export function resolveVocabPracticeType(type: unknown): VocabPracticeType {
  if (type === VocabPracticeType.Puzzle) {
    return VocabPracticeType.Puzzle;
  }
  if (type === VocabPracticeType.Paper) {
    return VocabPracticeType.Paper;
  }
  return VocabPracticeType.Spell;
}
