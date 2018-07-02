import { fileToString } from './file-to-string';

describe('fileToString()', () => {
  it('should read file and return string', async () => {
    const expected = {
      'a': 'first value',
      'b': 'second value'
    };

    const file = new File([ JSON.stringify(expected) ], 'testfile');
    const parsedFile = JSON.parse(await fileToString(file));

    expect(parsedFile).toEqual(expected);
  });
});
