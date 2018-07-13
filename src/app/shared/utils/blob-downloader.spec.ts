import { BlobDownloader } from './blob-downloader';

describe('BlobDownloader', () => {
  let blobDownloader: BlobDownloader;

  beforeEach(() => {
    blobDownloader = new BlobDownloader();
  });

  describe('#downloadBlob()', () => {
    it('shouldn\'t throw any errors', () => {
      const blob = new Blob([ new Uint8Array([ 0, 1, 2 ]) ]);

      expect(async () => await blobDownloader.downloadBlob(URL.createObjectURL(blob), 'filename')).not.toThrow();
    });
  });

  describe('#fetchBlobContents()', () => {
    it('should return file contents', async () => {
      const content = 'test content';
      const blob = new Blob([ content ]);

      const result = await blobDownloader.fetchBlobContents(URL.createObjectURL(blob));

      expect(result).toEqual(content);
    });
  });
});
