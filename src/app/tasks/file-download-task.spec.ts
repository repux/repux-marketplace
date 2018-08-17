import { FileDownloadTask, STATUS } from './file-download-task';
import { EventType } from 'repux-lib';

describe('FileDownloadTask', () => {
  let fileDownloaderDownload, downloaderEventHandler, fileDownloaderOn, fileDownloaderTerminate, fileDownloader, repuxLibService,
    taskManagerService, fileDownloadTask, commonDialogServiceSpy;
  const productAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';
  const fileHash = 'BUYER_META_HASH';
  const privateKey = 'BUYER_PRIVATE_KEY';
  const filename = 'filename.txt';

  beforeEach(() => {
    fileDownloaderDownload = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    downloaderEventHandler = {};
    fileDownloaderOn = jasmine.createSpy().and.callFake(function (eventType, handler) {
      downloaderEventHandler[ eventType ] = handler;
      return this;
    });
    fileDownloaderTerminate = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    fileDownloader = {
      download: fileDownloaderDownload,
      on: fileDownloaderOn,
      terminate: fileDownloaderTerminate
    };
    const createFileDownloader = jasmine.createSpy().and.returnValue(fileDownloader);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibService.getInstance.and.returnValue({ createFileDownloader });
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'onTaskEvent' ]);

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'alert' ]);

    fileDownloadTask = new FileDownloadTask(
      buyerAddress,
      productAddress,
      buyerAddress,
      fileHash,
      <any> privateKey,
      filename,
      repuxLibService,
      commonDialogServiceSpy
    );
  });

  describe('#constructor()', () => {
    it('should create downloader object', () => {
      expect(fileDownloadTask[ '_dataProductAddress' ]).toBe(productAddress);
      expect(fileDownloadTask[ '_buyerAddress' ]).toBe(buyerAddress);
      expect(fileDownloadTask[ '_metaFileHash' ]).toBe(fileHash);
      expect(fileDownloadTask[ '_buyerPrivateKey' ]).toBe(privateKey);
      expect(fileDownloadTask[ '_repuxLibService' ]).toBe(repuxLibService);
      expect(fileDownloadTask[ '_downloader' ]).toBe(fileDownloader);
      expect(fileDownloadTask[ 'commonDialogService' ]).toBe(commonDialogServiceSpy);
      expect(fileDownloadTask.name).toBe('Downloading ' + filename);
    });
  });

  describe('#run()', () => {
    it('should change status and assign taskManagerService', () => {
      fileDownloadTask.run(<any> taskManagerService);

      expect(<any> fileDownloadTask[ '_taskManagerService' ]).toBe(taskManagerService);
      expect(fileDownloadTask.status).toBe(STATUS.DOWNLOADING);
    });

    it('should call download function on _downloader object', () => {
      fileDownloadTask.run(<any> taskManagerService);

      expect(fileDownloaderDownload.calls.count()).toBe(1);
      expect(fileDownloaderDownload.calls.allArgs()[ 0 ][ 0 ]).toBe(privateKey);
      expect(fileDownloaderDownload.calls.allArgs()[ 0 ][ 1 ]).toBe(fileHash);
    });

    it('should update _progress when progress event is received', () => {
      fileDownloadTask.run(<any> taskManagerService);

      downloaderEventHandler[ EventType.PROGRESS ](EventType.PROGRESS, 0.15);
      expect(fileDownloadTask.progress).toBe(15);
    });

    it('should update _finished, _errors, and _status when error event is received', () => {
      const errorMessage = 'ERROR_MESSAGE';

      fileDownloadTask.run(<any> taskManagerService);

      downloaderEventHandler[ EventType.ERROR ](EventType.ERROR, errorMessage);
      expect(fileDownloadTask.errors).toEqual([ errorMessage ]);
      expect(fileDownloadTask.finished).toBeTruthy();
      expect(fileDownloadTask.status).toBe(STATUS.CANCELED);
    });

    it('should update _progress, _result, _needsUserAction, _userActionName and _status when ' +
      'finish event is received', () => {
      const result = 'RESULT';

      fileDownloadTask.run(<any> taskManagerService);

      downloaderEventHandler[ EventType.FINISH ](EventType.FINISH, result);
      expect(fileDownloadTask[ '_result' ]).toEqual(result);
      expect(fileDownloadTask.progress).toEqual(100);
      expect(fileDownloadTask.needsUserAction).toBeFalsy();
      expect(fileDownloadTask.userActionName).toBeFalsy();
      expect(fileDownloadTask.finished).toBeTruthy();
      expect(fileDownloadTask.status).toBe(STATUS.FINISHED);
    });

    it('should call taskManagerService.onTaskEvent() when any event is received', () => {
      fileDownloadTask.run(<any> taskManagerService);
      const events = `${EventType.PROGRESS},${EventType.ERROR},${EventType.FINISH}`;

      downloaderEventHandler[ events ](EventType.PROGRESS, 0);
      downloaderEventHandler[ events ](EventType.ERROR, '');
      downloaderEventHandler[ events ](EventType.FINISH, '');
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(3);
    });
  });

  describe('#cancel()', () => {
    it('should terminate task and set status as canceled', () => {
      fileDownloadTask[ '_taskManagerService' ] = taskManagerService;

      fileDownloadTask.cancel();

      expect(fileDownloader.terminate.calls.count()).toBe(1);
      expect(fileDownloadTask.finished).toBeTruthy();
      expect(fileDownloadTask.errors).toEqual([ STATUS.CANCELED ]);
      expect(fileDownloadTask.status).toBe(STATUS.CANCELED);
    });

    it('should call taskManagerService.onTaskEvent()', () => {
      fileDownloadTask[ '_taskManagerService' ] = taskManagerService;

      fileDownloadTask.cancel();

      expect(taskManagerService.onTaskEvent.calls.count()).toBe(1);
    });
  });

  describe('#get progress()', () => {
    it('should return _progress', () => {
      const progress = 15;
      fileDownloadTask[ '_progress' ] = progress;
      expect(fileDownloadTask.progress).toBe(progress);
    });
  });

  describe('#get errors()', () => {
    it('should return _errors', () => {
      const errors = [ 'ERROR' ];
      let catchedErrors = 0;
      fileDownloadTask[ '_errors' ] = errors;
      const result = fileDownloadTask.errors;
      expect(result).toEqual(errors);
      try {
        result[ 'push' ]('ERROR_2');
      } catch (error) {
        catchedErrors++;
      }
      expect(result).toEqual(errors);
      expect(catchedErrors).toBe(1);
    });
  });

  describe('#get finished()', () => {
    it('should return _finished', () => {
      const finished = true;
      fileDownloadTask[ '_finished' ] = finished;
      expect(fileDownloadTask.finished).toBe(finished);
    });
  });

  describe('#get name()', () => {
    it('should return _name', () => {
      const name = 'NAME';
      fileDownloadTask[ '_name' ] = name;
      expect(fileDownloadTask.name).toBe(name);
    });
  });

  describe('#get status()', () => {
    it('should return _status', () => {
      const status = 'STATUS';
      fileDownloadTask[ '_status' ] = status;
      expect(fileDownloadTask.status).toBe(status);
    });
  });

  describe('#get productAddress()', () => {
    it('should return __dataProductAddress', () => {
      const address = 'ADDRESS';
      fileDownloadTask[ '_dataProductAddress' ] = address;
      expect(fileDownloadTask.productAddress).toBe(address);
    });
  });

  describe('#displayDecryptionErrorMessage()', () => {
    it('should call commonDialogService.alert with proper arguments', () => {
      fileDownloadTask.displayDecryptionErrorMessage();
      expect(commonDialogServiceSpy.alert.calls.allArgs()[ 0 ][ 0 ]).toBe(
        'You can not decrypt the file. Please upload the key pair that was used during buy transaction.'
      );
      expect(commonDialogServiceSpy.alert.calls.allArgs()[ 0 ][ 1 ]).toBe('Decryption error');
    });
  });
});
