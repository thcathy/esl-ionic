import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  it('truncate with default input', () => {
    const pipe = new TruncatePipe();
    expect(pipe.transform('short')).toBe('short');
    expect(pipe.transform('this is a string 123')).toBe('this is a string 123');
    expect(pipe.transform('this is a string 1234')).toBe('this is a string ...');
  });

  it('truncate with limit', () => {
    const pipe = new TruncatePipe();
    expect(pipe.transform('short', 5)).toBe('short');
    expect(pipe.transform('short', 4)).toBe('s...');
  });

  it('truncate with different ellipsis', () => {
    const pipe = new TruncatePipe();
    expect(pipe.transform('long string', 5, '*****')).toBe('*****');
  });
});
