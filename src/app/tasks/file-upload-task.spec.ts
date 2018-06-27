import { FileUploadTask, STATUS } from './file-upload-task';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../services/data-product.service';
import { RepuxLibService } from '../services/repux-lib.service';
import { defer } from 'rxjs/index';

describe('FileUploadTask()', () => {
  let fileUploadTask: FileUploadTask, dataProductService, repuxLibService, fileUploader, fileUploaderUpload,
    fileUploaderOn, taskManagerService, uploaderEventHandlers, fileUploaderTerminate;
  const fileName = 'FILE_NAME';
  const publicKey = 'PUBLIC_KEY';
  const title = 'TITLE';
  const shortDescription = 'SHORT_DESCRIPTION';
  const longDescription = 'LONG_DESCRIPTION';
  const category = [ 'CATEGORY' ];
  const price = new BigNumber(1);
  const file = new File([ new Blob([]) ], fileName);

  beforeEach(() => {
    fileUploaderUpload = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    uploaderEventHandlers = {};
    fileUploaderOn = jasmine.createSpy().and.callFake(function (eventType, handler) {
      uploaderEventHandlers[ eventType ] = handler;
      return this;
    });
    fileUploaderTerminate = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    fileUploader = {
      upload: fileUploaderUpload,
      on: fileUploaderOn,
      terminate: fileUploaderTerminate
    };
    const createFileUploader = jasmine.createSpy().and.returnValue(fileUploader);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibService.getInstance.and.returnValue({
      createFileUploader
    });
    dataProductService = jasmine.createSpyObj('DataProductService', [ 'publishDataProduct' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'onTaskEvent' ]);

    fileUploadTask = new FileUploadTask(
      <any> publicKey,
      repuxLibService,
      dataProductService,
      title,
      shortDescription,
      longDescription,
      category,
      price,
      <any> file,
      1
    );
  });

  describe('#constructor()', () => {
    it('shoud create uploader object', () => {
      const createFileUploader = jasmine.createSpy().and.returnValue(fileUploader);
      repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
      repuxLibService.getInstance.and.returnValue({
        createFileUploader
      });

      fileUploadTask = new FileUploadTask(
        <any> publicKey,
        repuxLibService,
        dataProductService,
        title,
        shortDescription,
        longDescription,
        category,
        price,
        <any> file,
        1
      );

      expect(<any> fileUploadTask[ '_publicKey' ]).toBe(publicKey);
      expect(fileUploadTask[ '_repuxLibService' ]).toBe(repuxLibService);
      expect(fileUploadTask[ '_dataProductService' ]).toBe(dataProductService);
      expect(fileUploadTask[ '_title' ]).toBe(title);
      expect(fileUploadTask[ '_shortDescription' ]).toBe(shortDescription);
      expect(fileUploadTask[ '_longDescription' ]).toBe(longDescription);
      expect(fileUploadTask[ '_category' ]).toBe(category);
      expect(fileUploadTask[ '_price' ]).toBe(price);
      expect(<any> fileUploadTask[ '_file' ]).toBe(file);
      expect(fileUploadTask[ '_uploader' ]).toBe(fileUploader);
      expect(fileUploadTask[ '_name' ]).toBe('Creating ' + fileName);
    });
  });

  describe('#run()', () => {
    it('should change status and assign taskManagerService', () => {
      fileUploadTask.run(<any> taskManagerService);
      expect(<any> fileUploadTask[ '_taskManagerService' ]).toBe(taskManagerService);
      expect(fileUploadTask.status).toBe(STATUS.UPLOADING);
    });

    it('should call upload function on _upload property', () => {
      fileUploadTask.run(<any> taskManagerService);
      expect(fileUploaderUpload.calls.count()).toBe(1);
      expect(fileUploaderUpload.calls.allArgs()[ 0 ][ 0 ]).toBe(publicKey);
      expect(fileUploaderUpload.calls.allArgs()[ 0 ][ 1 ]).toBe(file);
      expect(fileUploaderUpload.calls.allArgs()[ 0 ][ 2 ]).toEqual({
        title,
        shortDescription,
        longDescription,
        category,
        price
      });
    });

    it('should update _progress when progress event is received', () => {
      fileUploadTask.run(<any> taskManagerService);
      uploaderEventHandlers[ 'progress' ]('progress', 0.15);
      expect(fileUploadTask[ '_progress' ]).toBe(15);
    });

    it('should update _finished, _errors, and _status when error event is received', () => {
      const errorMessage = 'ERROR_MESSAGE';
      fileUploadTask.run(<any> taskManagerService);
      uploaderEventHandlers[ 'error' ]('error', errorMessage);
      expect(fileUploadTask[ '_errors' ]).toEqual([ errorMessage ]);
      expect(fileUploadTask[ '_finished' ]).toBeTruthy();
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.CANCELED);
    });

    it('should update _progress, _result, _needsUserAction, _userActionName and _status when ' +
      'finish event is received', () => {
      const result = 'RESULT';
      fileUploadTask.run(<any> taskManagerService);
      uploaderEventHandlers[ 'finish' ]('finish', result);
      expect(fileUploadTask[ '_progress' ]).toEqual(100);
      expect(fileUploadTask[ '_result' ]).toEqual(result);
      expect(fileUploadTask[ '_needsUserAction' ]).toBeTruthy();
      expect(fileUploadTask[ '_userActionName' ]).toBe('Publish');
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.WAITING_FOR_PUBLICATION);
    });

    it('should call taskManagerService.onTaskEvent() when any event is received', () => {
      fileUploadTask.run(<any> taskManagerService);
      uploaderEventHandlers[ 'progress, error, finish' ]('progress', 0);
      uploaderEventHandlers[ 'progress, error, finish' ]('error', '');
      uploaderEventHandlers[ 'progress, error, finish' ]('finish', '');
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(3);
    });
  });

  describe('#cancel()', () => {
    it('should terminate task and set status as canceled', () => {
      fileUploadTask[ '_taskManagerService' ] = taskManagerService;
      fileUploadTask.cancel();
      expect(fileUploader.terminate.calls.count()).toBe(1);
      expect(fileUploadTask[ '_finished' ]).toBeTruthy();
      expect(fileUploadTask[ '_errors' ]).toEqual([ STATUS.CANCELED ]);
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.CANCELED);
    });

    it('should call taskManagerService.onTaskEvent()', () => {
      fileUploadTask[ '_taskManagerService' ] = taskManagerService;
      fileUploadTask.cancel();
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(1);
    });
  });

  describe('#callUserAction()', () => {
    it('should set call dataProductService.publishDataProduct and set task as finished', async () => {
      dataProductService.publishDataProduct.and.returnValue(Promise.resolve());
      fileUploadTask[ '_taskManagerService' ] = taskManagerService;
      fileUploadTask[ '_needsUserAction' ] = true;
      fileUploadTask[ '_result' ] = 'RESULT';
      fileUploadTask[ '_price' ] = new BigNumber(1);
      await fileUploadTask.callUserAction();
      expect(fileUploadTask[ '_needsUserAction' ]).toBeFalsy();
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.FINISHED);
      expect(fileUploadTask[ '_finished' ]).toBeTruthy();
      expect(dataProductService.publishDataProduct.calls.allArgs()[ 0 ][ 0 ]).toBe(fileUploadTask[ '_result' ]);
      expect(dataProductService.publishDataProduct.calls.allArgs()[ 0 ][ 1 ]).toBe(fileUploadTask[ '_price' ]);
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(2);
    });

    it('should handle rejection of dataProductService.publishDataProduct', async () => {
      const error = 'ERROR';
      dataProductService.publishDataProduct.and.returnValue(Promise.reject(error));
      fileUploadTask[ '_taskManagerService' ] = taskManagerService;
      fileUploadTask[ '_needsUserAction' ] = true;
      fileUploadTask[ '_result' ] = 'RESULT';
      fileUploadTask[ '_price' ] = new BigNumber(1);
      await fileUploadTask.callUserAction();
      expect(fileUploadTask[ '_needsUserAction' ]).toBeTruthy();
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.PUBLICATION_REJECTED);
      expect(fileUploadTask[ '_finished' ]).toBeFalsy();
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(2);
    });
  });

  describe('#get progress()', () => {
    it('should return _progress', () => {
      const progress = 15;
      fileUploadTask[ '_progress' ] = progress;
      expect(fileUploadTask.progress).toBe(progress);
    });
  });

  describe('#get errors()', () => {
    it('should return _errors', () => {
      const errors = [ 'ERROR' ];
      let catchedErrors = 0;
      fileUploadTask[ '_errors' ] = errors;
      const result = fileUploadTask.errors;
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
      fileUploadTask[ '_finished' ] = finished;
      expect(fileUploadTask.finished).toBe(finished);
    });
  });

  describe('#get name()', () => {
    it('should return _name', () => {
      const name = 'NAME';
      fileUploadTask[ '_name' ] = name;
      expect(fileUploadTask.name).toBe(name);
    });
  });

  describe('#get needsUserAction()', () => {
    it('should return _needsUserAction', () => {
      const needsUserAction = true;
      fileUploadTask[ '_needsUserAction' ] = needsUserAction;
      expect(fileUploadTask.needsUserAction).toBe(needsUserAction);
    });
  });

  describe('#get userActionName()', () => {
    it('should return _userActionName', () => {
      const userActionName = 'ACTION_NAME';
      fileUploadTask[ '_userActionName' ] = userActionName;
      expect(fileUploadTask.userActionName).toBe(userActionName);
    });
  });

  describe('#get status()', () => {
    it('should return _status', () => {
      const status = 'STATUS';
      fileUploadTask[ '_status' ] = status;
      expect(fileUploadTask.status).toBe(status);
    });
  });

  describe('#_createMetadata()', () => {
    it('should return metadata object', () => {
      expect(fileUploadTask[ '_createMetadata' ]()).toEqual({
        title,
        shortDescription,
        longDescription,
        category,
        price
      });
    });
  });
});
