import { FileSize, maxUnitBySize, sizeShortcut } from './file-size';

describe('FileSize', () => {
  describe('#sizeShortcut()', () => {
    it('should return proper shortcut for all units', () => {
      expect(sizeShortcut(FileSize.BYTE)).toBe('B');
      expect(sizeShortcut(FileSize.KILOBYTE)).toBe('kB');
      expect(sizeShortcut(FileSize.MEGABYTE)).toBe('MB');
      expect(sizeShortcut(FileSize.GIGABYTE)).toBe('GB');
      expect(sizeShortcut(FileSize.TERABYTE)).toBe('TB');
      expect(sizeShortcut(FileSize.PETABYTE)).toBe('PB');
    });
  });

  describe('#maxUnitBySize()', () => {
    it('should return maximum unit for provided file size', () => {
      expect(maxUnitBySize(12 * FileSize.BYTE)).toBe(FileSize.BYTE);
      expect(maxUnitBySize(1200 * FileSize.BYTE)).toBe(FileSize.KILOBYTE);
      expect(maxUnitBySize(1200 * FileSize.KILOBYTE)).toBe(FileSize.MEGABYTE);
      expect(maxUnitBySize(1200 * FileSize.MEGABYTE)).toBe(FileSize.GIGABYTE);
      expect(maxUnitBySize(1200 * FileSize.GIGABYTE)).toBe(FileSize.TERABYTE);
      expect(maxUnitBySize(1200 * FileSize.TERABYTE)).toBe(FileSize.PETABYTE);
      expect(maxUnitBySize(1200 * FileSize.PETABYTE)).toBe(FileSize.PETABYTE);
    });
  });
});
