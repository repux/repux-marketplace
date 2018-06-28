import { FileReencryptionTask, STATUS } from './file-reencryption-task';

describe('FileReencryptionTask', () => {
  let fileReencryptorReencrypt, reencryptorEventHandlers, fileReencryptorOn, fileReencryptorTerminate, fileReencryptor,
    repuxLibService,
    dataProductService, taskManagerService, fileReencryptionTask, matDialog, keyStoreService;
  const productAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';
  const fileHash = 'SELLER_META_HASH';
  const buyerPublicKey = 'PUBLIC_KEY';
  const sellerPrivateKey = 'PRIVATE_KEY';

  beforeEach(() => {
    fileReencryptorReencrypt = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    reencryptorEventHandlers = {};
    fileReencryptorOn = jasmine.createSpy().and.callFake(function (eventType, handler) {
      reencryptorEventHandlers[ eventType ] = handler;
      return this;
    });
    fileReencryptorTerminate = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    fileReencryptor = {
      reencrypt: fileReencryptorReencrypt,
      on: fileReencryptorOn,
      terminate: fileReencryptorTerminate
    };
    const createFileReencryptor = jasmine.createSpy().and.returnValue(fileReencryptor);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibService.getInstance.and.returnValue({
      createFileReencryptor
    });
    dataProductService = jasmine.createSpyObj('DataProductService', [ 'finaliseDataProductPurchase' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'onTaskEvent' ]);
    keyStoreService = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    fileReencryptionTask = new FileReencryptionTask(
      productAddress,
      buyerAddress,
      fileHash,
      <any> sellerPrivateKey,
      <any> buyerPublicKey,
      repuxLibService,
      dataProductService,
      keyStoreService,
      matDialog
    );
  });

  describe('#constructor()', () => {
    it('should create reeencryptor object', () => {
      expect(fileReencryptionTask[ '_dataProductAddress' ]).toBe(productAddress);
      expect(fileReencryptionTask[ '_buyerAddress' ]).toBe(buyerAddress);
      expect(fileReencryptionTask[ '_metaFileHash' ]).toBe(fileHash);
      expect(<any> fileReencryptionTask[ '_sellerPrivateKey' ]).toBe(sellerPrivateKey);
      expect(<any> fileReencryptionTask[ '_buyerPublicKey' ]).toBe(buyerPublicKey);
      expect(fileReencryptionTask[ '_repuxLibService' ]).toBe(repuxLibService);
      expect(fileReencryptionTask[ '_dataProductService' ]).toBe(dataProductService);
      expect(fileReencryptionTask[ '_keyStoreService' ]).toBe(keyStoreService);
      expect(fileReencryptionTask[ '_dialog' ]).toBe(matDialog);
      expect(fileReencryptionTask[ '_reencryptor' ]).toBe(fileReencryptor);
      expect(fileReencryptionTask[ '_name' ]).toBe('Selling ' + productAddress);
    });
  });

  describe('#run()', () => {
    it('should change status and assign taskManagerService', () => {
      fileReencryptionTask.run(<any> taskManagerService);
      expect(<any> fileReencryptionTask[ '_taskManagerService' ]).toBe(taskManagerService);
      expect(fileReencryptionTask.status).toBe(STATUS.REENCRYPTION);
    });

    it('should call reencrypt function on _reencryptor property', () => {
      fileReencryptionTask.run(<any> taskManagerService);
      expect(fileReencryptorReencrypt.calls.count()).toBe(1);
      expect(fileReencryptorReencrypt.calls.allArgs()[ 0 ][ 0 ]).toBe(sellerPrivateKey);
      expect(fileReencryptorReencrypt.calls.allArgs()[ 0 ][ 1 ]).toBe(buyerPublicKey);
      expect(fileReencryptorReencrypt.calls.allArgs()[ 0 ][ 2 ]).toBe(fileHash);
    });

    it('should update _progress when progress event is received', () => {
      fileReencryptionTask.run(<any> taskManagerService);
      reencryptorEventHandlers[ 'progress' ]('progress', 0.15);
      expect(fileReencryptionTask[ '_progress' ]).toBe(15);
    });

    it('should update _finished, _errors, and _status when error event is received', () => {
      const errorMessage = 'ERROR_MESSAGE';
      fileReencryptionTask.run(<any> taskManagerService);
      reencryptorEventHandlers[ 'error' ]('error', errorMessage);
      expect(fileReencryptionTask[ '_errors' ]).toEqual([ errorMessage ]);
      expect(fileReencryptionTask[ '_finished' ]).toBeTruthy();
      expect(fileReencryptionTask[ '_status' ]).toBe(STATUS.CANCELED);
    });

    it('should update _progress, _result, _needsUserAction, _userActionName and _status when ' +
      'finish event is received', () => {
      const result = 'RESULT';
      fileReencryptionTask.run(<any> taskManagerService);
      reencryptorEventHandlers[ 'finish' ]('finish', result);
      expect(fileReencryptionTask[ '_progress' ]).toEqual(100);
      expect(fileReencryptionTask[ '_result' ]).toEqual(result);
      expect(fileReencryptionTask[ '_needsUserAction' ]).toBeTruthy();
      expect(fileReencryptionTask[ '_userActionName' ]).toBe('Finalise');
      expect(fileReencryptionTask[ '_status' ]).toBe(STATUS.WAITING_FOR_FINALISATION);
    });

    it('should call taskManagerService.onTaskEvent() when any event is received', () => {
      fileReencryptionTask.run(<any> taskManagerService);
      reencryptorEventHandlers[ 'progress, error, finish' ]('progress', 0);
      reencryptorEventHandlers[ 'progress, error, finish' ]('error', '');
      reencryptorEventHandlers[ 'progress, error, finish' ]('finish', '');
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(3);
    });
  });

  describe('#cancel()', () => {
    it('should terminate task and set status as canceled', () => {
      fileReencryptionTask[ '_taskManagerService' ] = taskManagerService;
      fileReencryptionTask.cancel();
      expect(fileReencryptor.terminate.calls.count()).toBe(1);
      expect(fileReencryptionTask[ '_finished' ]).toBeTruthy();
      expect(fileReencryptionTask[ '_errors' ]).toEqual([ STATUS.CANCELED ]);
      expect(fileReencryptionTask[ '_status' ]).toBe(STATUS.CANCELED);
    });

    it('should call taskManagerService.onTaskEvent()', () => {
      fileReencryptionTask[ '_taskManagerService' ] = taskManagerService;
      fileReencryptionTask.cancel();
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(1);
    });
  });

  describe('#callUserAction()', () => {
    it('should call dataProductService.finaliseDataProductPurchase', async () => {
      dataProductService.finaliseDataProductPurchase.and.returnValue(Promise.resolve());
      fileReencryptionTask[ '_status' ] = STATUS.WAITING_FOR_FINALISATION;
      fileReencryptionTask[ '_taskManagerService' ] = taskManagerService;
      fileReencryptionTask[ '_needsUserAction' ] = true;
      fileReencryptionTask[ '_result' ] = 'RESULT';

      await fileReencryptionTask.callUserAction();
      expect(fileReencryptionTask[ '_needsUserAction' ]).toBeFalsy();
      expect(fileReencryptionTask[ '_status' ]).toBe(STATUS.FINISHED);
      expect(fileReencryptionTask[ '_finished' ]).toBeTruthy();
      expect(dataProductService.finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 0 ]).toBe(fileReencryptionTask[ '_dataProductAddress' ]);
      expect(dataProductService.finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 1 ]).toBe(fileReencryptionTask[ '_buyerAddress' ]);
      expect(dataProductService.finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 2 ]).toBe(fileReencryptionTask[ '_result' ]);
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(2);
    });

    it('should handle rejection of dataProductService.finaliseDataProductPurchase', async () => {
      const error = 'ERROR';
      dataProductService.finaliseDataProductPurchase.and.returnValue(Promise.reject(error));
      fileReencryptionTask[ '_status' ] = STATUS.WAITING_FOR_FINALISATION;
      fileReencryptionTask[ '_taskManagerService' ] = taskManagerService;
      fileReencryptionTask[ '_needsUserAction' ] = true;
      fileReencryptionTask[ '_result' ] = 'RESULT';

      await fileReencryptionTask.callUserAction();
      expect(fileReencryptionTask[ '_needsUserAction' ]).toBeTruthy();
      expect(fileReencryptionTask[ '_status' ]).toBe(STATUS.REJECTED);
      expect(fileReencryptionTask[ '_finished' ]).toBeFalsy();
      expect(taskManagerService.onTaskEvent.calls.count()).toBe(2);
    });
  });

  describe('#get progress()', () => {
    it('should return _progress', () => {
      const progress = 15;
      fileReencryptionTask[ '_progress' ] = progress;
      expect(fileReencryptionTask.progress).toBe(progress);
    });
  });

  describe('#get errors()', () => {
    it('should return _errors', () => {
      const errors = [ 'ERROR' ];
      let catchedErrors = 0;
      fileReencryptionTask[ '_errors' ] = errors;
      const result = fileReencryptionTask.errors;
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
      fileReencryptionTask[ '_finished' ] = finished;
      expect(fileReencryptionTask.finished).toBe(finished);
    });
  });

  describe('#get name()', () => {
    it('should return _name', () => {
      const name = 'NAME';
      fileReencryptionTask[ '_name' ] = name;
      expect(fileReencryptionTask.name).toBe(name);
    });
  });

  describe('#get needsUserAction()', () => {
    it('should return _needsUserAction', () => {
      const needsUserAction = true;
      fileReencryptionTask[ '_needsUserAction' ] = needsUserAction;
      expect(fileReencryptionTask.needsUserAction).toBe(needsUserAction);
    });
  });

  describe('#get userActionName()', () => {
    it('should return _userActionName', () => {
      const userActionName = 'ACTION_NAME';
      fileReencryptionTask[ '_userActionName' ] = userActionName;
      expect(fileReencryptionTask.userActionName).toBe(userActionName);
    });
  });

  describe('#get status()', () => {
    it('should return _status', () => {
      const status = 'STATUS';
      fileReencryptionTask[ '_status' ] = status;
      expect(fileReencryptionTask.status).toBe(status);
    });
  });
});