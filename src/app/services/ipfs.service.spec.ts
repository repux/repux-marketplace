import { IpfsService } from './ipfs.service';
import { environment } from '../../environments/environment';
import { IpfsFile, IpfsFileContent } from 'ipfs-api';
import { Buffer } from 'buffer';

describe('IpfsService', () => {
  let ipfsService;

  beforeEach(() => {
    window.IpfsApi = function (config) {
      this.config = config;
    };
    ipfsService = new IpfsService();
  });

  describe('#getInstance()', () => {
    it('should return IpfsApi instance', () => {
      expect(ipfsService.getInstance().config).toBe(environment.ipfs);
      expect(ipfsService.getInstance() instanceof window.IpfsApi).toBeTruthy();
    });
  });

  describe('#uploadFile()', () => {
    it('should call upload with proper arguments', async () => {
      const expectedResult = <IpfsFile> { hash: 'HASH' };
      const content = new Uint8Array([ 0, 1, 2 ]);
      const file = new File([ content ], 'fileName');
      const uploadSpy = jasmine.createSpy().and.returnValue(expectedResult);

      ipfsService.upload = uploadSpy;

      const result = await ipfsService.uploadFile(file);

      expect(uploadSpy.calls.count()).toBe(1);
      expect(uploadSpy.calls.allArgs()[ 0 ][ 0 ]).toEqual(Buffer.from(content));
      expect(result).toBe(expectedResult);
    });
  });

  describe('#upload()', () => {
    it('should call this.ipfs.files.add with proper arguments', async () => {
      const content = new Uint8Array([ 0, 1, 2 ]);
      const providedBuffer = Buffer.from(content);
      const expectedResult = <IpfsFile> { hash: 'HASH' };
      ipfsService[ 'ipfs' ] = {
        files: {
          add(buffer: Buffer, callback: (error: string, files: IpfsFile[]) => void) {
            expect(buffer).toBe(providedBuffer);

            callback(null, [ expectedResult ]);
          }
        }
      };

      const result = await ipfsService.upload(providedBuffer);

      expect(result).toBe(expectedResult);
    });
  });

  describe('#downloadAndSave()', () => {
    it('should call this.download() and save downloaded contents', async () => {
      const fileHash = 'HASH';
      const fileName = 'NAME';
      const content = new Uint8Array([ 0, 1, 2 ]);
      const downloadSpy = jasmine.createSpy().and.returnValue(Promise.resolve(content));
      const blobDownloader = jasmine.createSpyObj('BlobDownloader', [ 'downloadBlob' ]);

      ipfsService.download = downloadSpy;
      ipfsService[ 'blobDownloader' ] = blobDownloader;

      await ipfsService.downloadAndSave(fileHash, fileName);

      expect(downloadSpy.calls.count()).toBe(1);
      expect(downloadSpy.calls.allArgs()[ 0 ][ 0 ]).toBe(fileHash);
      expect(blobDownloader.downloadBlob.calls.count()).toBe(1);
      expect(blobDownloader.downloadBlob.calls.allArgs()[ 0 ][ 0 ].startsWith('blob:http://')).toBeTruthy();
      expect(blobDownloader.downloadBlob.calls.allArgs()[ 0 ][ 1 ]).toBe(fileName);
    });
  });

  describe('#download()', () => {
    it('should call this.ipfs.files.get with proper arguments', async () => {
      const fileHash = 'HASH';
      const content = new Uint8Array([ 0, 1, 2 ]);
      ipfsService[ 'ipfs' ] = {
        files: {
          get(hash: string, callback: (error: string, files: IpfsFileContent[]) => void) {
            expect(hash).toBe(fileHash);

            callback(null, [ { content } ]);
          }
        }
      };

      const result = await ipfsService.download(fileHash);

      expect(result).toBe(content);
    });
  });
});
