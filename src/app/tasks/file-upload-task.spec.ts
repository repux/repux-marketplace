import { FileUploadTask, STATUS } from './file-upload-task';
import BigNumber from 'bignumber.js';
import { EventType } from '@repux/repux-lib';
import { EulaSelection } from '../marketplace/marketplace-eula-selector/marketplace-eula-selector.component';
import { EulaType, PurchaseType } from '@repux/repux-lib';
import { ActionButtonType } from '../shared/enums/action-button-type';

describe('FileUploadTask()', () => {
  let fileUploadTask: FileUploadTask,
    repuxLibServiceSpy,
    fileUploader,
    fileUploaderUploadSpy,
    fileUploaderOnSpy,
    taskManagerServiceSpy,
    uploaderEventHandlers,
    fileUploaderTerminateSpy,
    unpublishedProductsServiceSpy,
    transactionServiceSpy,
    ipfsServiceSpy;
  const fileName = 'FILE_NAME';
  const publicKey = 'PUBLIC_KEY';
  const title = 'TITLE';
  const shortDescription = 'SHORT_DESCRIPTION';
  const fullDescription = 'FULL_DESCRIPTION';
  const category = [ 'CATEGORY' ];
  const price = new BigNumber(1);
  const file = new File([ new Blob([]) ], fileName);
  const daysToDeliver = 1;
  const sampleFiles = [];
  const eulaSelection: EulaSelection = {
    type: EulaType.OWNER,
    file
  };
  const maxNumberOfDownloads = -1;
  const type = PurchaseType.ONE_TIME_PURCHASE;
  const userAddress = '0x00';

  beforeEach(() => {
    fileUploaderUploadSpy = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    uploaderEventHandlers = {};
    fileUploaderOnSpy = jasmine.createSpy().and.callFake(function (eventType, handler) {
      uploaderEventHandlers[ eventType ] = handler;
      return this;
    });
    fileUploaderTerminateSpy = jasmine.createSpy().and.callFake(function () {
      return this;
    });
    fileUploader = {
      upload: fileUploaderUploadSpy,
      on: fileUploaderOnSpy,
      terminate: fileUploaderTerminateSpy
    };
    const createFileUploaderSpy = jasmine.createSpy().and.returnValue(fileUploader);
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibServiceSpy.getInstance.and.returnValue({
      createFileUploader: createFileUploaderSpy
    });
    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'onTaskEvent' ]);
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct', 'removeProduct' ]);
    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactions' ]);
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
        return {
          unsubscribe() {
          }
        };
      }
    });
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'uploadFile' ]);

    fileUploadTask = new FileUploadTask(
      userAddress,
      <any> publicKey,
      title,
      shortDescription,
      fullDescription,
      category,
      price,
      <any> file,
      daysToDeliver,
      <any> sampleFiles,
      eulaSelection,
      maxNumberOfDownloads,
      type,
      repuxLibServiceSpy,
      unpublishedProductsServiceSpy,
      ipfsServiceSpy,
      transactionServiceSpy
    );
  });

  describe('#constructor()', () => {
    it('shoud create uploader object', () => {
      expect(<any> fileUploadTask[ '_publicKey' ]).toBe(publicKey);
      expect(fileUploadTask[ '_title' ]).toBe(title);
      expect(fileUploadTask[ '_shortDescription' ]).toBe(shortDescription);
      expect(fileUploadTask[ '_fullDescription' ]).toBe(fullDescription);
      expect(fileUploadTask[ '_category' ]).toBe(category);
      expect(fileUploadTask[ '_price' ]).toBe(price);
      expect(<any> fileUploadTask[ '_file' ]).toBe(file);
      expect(<any> fileUploadTask[ '_daysToDeliver' ]).toBe(daysToDeliver);
      expect(<any> fileUploadTask[ '_sampleFiles' ]).toBe(sampleFiles);
      expect(<any> fileUploadTask[ '_eulaSelection' ]).toBe(eulaSelection);
      expect(fileUploadTask[ '_maxNumberOfDownloads' ]).toBe(maxNumberOfDownloads);
      expect(fileUploadTask[ '_purchaseType' ]).toBe(type);
      expect(fileUploadTask[ '_uploader' ]).toBe(fileUploader);
      expect(fileUploadTask.name).toBe('Uploading ' + fileName);
      expect(fileUploadTask[ '_repuxLibService' ]).toBe(repuxLibServiceSpy);
      expect(fileUploadTask[ '_unpublishedProductsService' ]).toBe(unpublishedProductsServiceSpy);
      expect(fileUploadTask[ '_ipfsService' ]).toBe(ipfsServiceSpy);
      expect(fileUploadTask[ 'transactionService' ]).toBe(transactionServiceSpy);
    });
  });

  describe('#run()', () => {
    it('should change status and assign taskManagerService', async () => {
      fileUploadTask.uploadEula = jasmine.createSpy();
      fileUploadTask.uploadSampleFiles = jasmine.createSpy();

      await fileUploadTask.run(<any> taskManagerServiceSpy);

      expect(<any> fileUploadTask[ '_taskManagerService' ]).toBe(taskManagerServiceSpy);
      expect(fileUploadTask.status).toBe(STATUS.UPLOADING);
    });

    it('should call upload function on _upload property', async () => {
      const eula = {
        type: EulaType.OWNER,
        fileHash: '',
        fileName: ''
      };
      fileUploadTask.uploadEula = jasmine.createSpy().and.returnValue(eula);
      fileUploadTask.uploadSampleFiles = jasmine.createSpy().and.returnValue([]);

      await fileUploadTask.run(<any> taskManagerServiceSpy);

      expect((<jasmine.Spy>fileUploadTask.uploadEula).calls.count()).toBe(1);
      expect((<jasmine.Spy>fileUploadTask.uploadSampleFiles).calls.count()).toBe(1);
      expect(fileUploaderUploadSpy.calls.count()).toBe(1);
      expect(fileUploaderUploadSpy.calls.allArgs()[ 0 ][ 0 ]).toBe(publicKey);
      expect(fileUploaderUploadSpy.calls.allArgs()[ 0 ][ 1 ]).toBe(file);
      expect(fileUploaderUploadSpy.calls.allArgs()[ 0 ][ 2 ]).toEqual({
        title,
        shortDescription,
        fullDescription,
        category,
        price,
        sampleFile: [],
        eula,
        maxNumberOfDownloads,
        type
      });
    });

    it('should update _progress when progress event is received', async () => {
      fileUploadTask.uploadEula = jasmine.createSpy();
      fileUploadTask.uploadSampleFiles = jasmine.createSpy();

      await fileUploadTask.run(<any> taskManagerServiceSpy);

      uploaderEventHandlers[ EventType.PROGRESS ](EventType.PROGRESS, 0.15);
      expect(fileUploadTask.progress).toBe(15);
    });

    it('should update _finished, _errors, and _status when error event is received', async () => {
      fileUploadTask.uploadEula = jasmine.createSpy();
      fileUploadTask.uploadSampleFiles = jasmine.createSpy();
      const errorMessage = 'ERROR_MESSAGE';

      await fileUploadTask.run(<any> taskManagerServiceSpy);

      uploaderEventHandlers[ EventType.ERROR ](EventType.ERROR, errorMessage);
      expect(fileUploadTask.errors).toEqual([ errorMessage ]);
      expect(fileUploadTask.finished).toBeTruthy();
      expect(fileUploadTask.status).toBe(STATUS.CANCELED);
    });

    it('should update _progress, _result, _actionButton and _status when ' +
      'finish event is received', async () => {
      fileUploadTask.uploadEula = jasmine.createSpy();
      fileUploadTask.uploadSampleFiles = jasmine.createSpy();
      const result = 'RESULT';

      await fileUploadTask.run(<any> taskManagerServiceSpy);

      uploaderEventHandlers[ EventType.FINISH ](EventType.FINISH, result);
      expect(fileUploadTask[ '_result' ]).toEqual(result);
      expect(fileUploadTask.progress).toEqual(100);
      expect(fileUploadTask.actionButton).toBe(ActionButtonType.Publish);
      expect(fileUploadTask.status).toBe(STATUS.WAITING_FOR_PUBLICATION);
    });

    it('should call taskManagerService.onTaskEvent() when any event is received', async () => {
      fileUploadTask.uploadEula = jasmine.createSpy();
      fileUploadTask.uploadSampleFiles = jasmine.createSpy();

      await fileUploadTask.run(<any> taskManagerServiceSpy);
      const events = `${EventType.PROGRESS},${EventType.ERROR},${EventType.FINISH}`;

      uploaderEventHandlers[ events ](EventType.PROGRESS, 0);
      uploaderEventHandlers[ events ](EventType.ERROR, '');
      uploaderEventHandlers[ events ](EventType.FINISH, '');
      expect(taskManagerServiceSpy.onTaskEvent.calls.count()).toBe(3);
    });
  });

  describe('#cancel()', () => {
    it('should terminate task and set status as canceled', () => {
      fileUploadTask[ '_taskManagerService' ] = taskManagerServiceSpy;

      fileUploadTask.cancel();

      expect(fileUploader.terminate.calls.count()).toBe(1);
      expect(fileUploadTask[ '_finished' ]).toBeTruthy();
      expect(fileUploadTask[ '_errors' ]).toEqual([ STATUS.CANCELED ]);
      expect(fileUploadTask[ '_status' ]).toBe(STATUS.CANCELED);
    });

    it('should call taskManagerService.onTaskEvent()', () => {
      fileUploadTask[ '_taskManagerService' ] = taskManagerServiceSpy;

      fileUploadTask.cancel();

      expect(taskManagerServiceSpy.onTaskEvent.calls.count()).toBe(1);
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

  describe('#get actionButton()', () => {
    it('should return _actionButton', () => {
      const actionButton = ActionButtonType.Publish;
      fileUploadTask[ '_actionButton' ] = actionButton;
      expect(fileUploadTask.actionButton).toBe(actionButton);
    });
  });

  describe('#get status()', () => {
    it('should return _status', () => {
      const status = 'STATUS';
      fileUploadTask[ '_status' ] = status;
      expect(fileUploadTask.status).toBe(status);
    });
  });

  describe('#get productAddress()', () => {
    it('should return undefined', () => {
      const address = 'ADDRESS';
      fileUploadTask[ '_dataProductAddress' ] = address;
      expect(fileUploadTask.productAddress).toBeUndefined();
    });
  });

  describe('#createMetadata()', () => {
    it('should return metadata object', () => {
      const sampleFile = [];
      const eula = {
        type: EulaType.OWNER,
        fileHash: '',
        fileName: ''
      };

      fileUploadTask[ '_sampleFile' ] = sampleFile;
      fileUploadTask[ '_eula' ] = eula;

      expect(fileUploadTask.createMetadata()).toEqual({
        title,
        shortDescription,
        fullDescription,
        category,
        price,
        sampleFile,
        eula,
        maxNumberOfDownloads,
        type
      });
    });
  });

  describe('#uploadSampleFiles()', () => {
    it('should call ipfsService.uploadFile() for all files', async () => {
      ipfsServiceSpy.uploadFile.and.callFake(fileObj => {
        return { hash: fileObj.name + '_hash' };
      });

      const file1 = { name: 'file1' };
      const file2 = { name: 'file2' };
      const files = <any> [ file1, file2 ];

      const result = await fileUploadTask.uploadSampleFiles(files);

      expect(ipfsServiceSpy.uploadFile.calls.count()).toBe(2);
      expect(result).toEqual([ {
        fileName: 'file1',
        title: 'file1',
        fileHash: 'file1_hash'
      }, {
        fileName: 'file2',
        title: 'file2',
        fileHash: 'file2_hash'
      } ]);
    });

    it('shouldn\'t call ipfsService.uploadFile() when there are no files', async () => {
      await fileUploadTask.uploadSampleFiles();

      expect(ipfsServiceSpy.uploadFile.calls.count()).toBe(0);
    });
  });

  describe('#uploadEula()', () => {
    it('should call ipfsService.uploadFile() with proper arguments', async () => {
      ipfsServiceSpy.uploadFile.and.callFake(fileObj => {
        return { hash: fileObj.name + '_hash' };
      });

      const selection = <EulaSelection> {
        type: EulaType.OWNER,
        file: {
          name: 'eulaFile'
        }
      };

      const result = await fileUploadTask.uploadEula(selection);

      expect(ipfsServiceSpy.uploadFile.calls.count()).toBe(1);
      expect(result).toEqual({
        fileName: 'eulaFile',
        type: EulaType.OWNER,
        fileHash: 'eulaFile_hash'
      });
    });
  });
});
