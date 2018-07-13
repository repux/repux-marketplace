import { FileName } from './file-name';

describe('FileName', () => {
  let fileName: FileName;

  beforeEach(() => {
    fileName = new FileName();
  });

  describe('#getFileNameFromPath', () => {
    it('should return fileName with extension from path', () => {
      expect(fileName.getFileNameFromPath('/path.to/the/file.txt')).toBe('file.txt');
      expect(fileName.getFileNameFromPath('\\path.to\\the\\file.txt')).toBe('file.txt');
    });
  });
});
