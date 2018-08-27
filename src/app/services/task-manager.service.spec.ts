import { TaskManagerService } from './task-manager.service';
import { TestBed } from '@angular/core/testing';
import { MarketplaceTaskManagerComponent } from '../marketplace/marketplace-task-manager/marketplace-task-manager.component';
import { MatDialogModule } from '@angular/material';
import { from } from 'rxjs';
import Wallet from '../shared/models/wallet';
import { TaskType } from '../tasks/task-type';

describe('TaskManagerService', () => {
  let matDialogSpy: { open: jasmine.Spy },
    walletServiceSpy: { getWallet: jasmine.Spy };
  let service: TaskManagerService;
  let componentInstance;
  const walletAddress = '0x00';
  const wallet = new Wallet(walletAddress, 1);

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    componentInstance = {
      setTaskManagerService: jasmine.createSpy(),
      openDialog: jasmine.createSpy(),
      closeDialog: jasmine.createSpy(),
      close: jasmine.createSpy()
    };
    matDialogSpy.open.and.returnValue({
      componentInstance
    });

    service = new TaskManagerService(<any> matDialogSpy, <any> walletServiceSpy);
    window.addEventListener = () => {
    };

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: MarketplaceTaskManagerComponent, useValue: {} }
      ]
    }).compileComponents();
  });

  describe('#get tasks()', () => {
    it('should return all tasks', () => {
      const tasks = [ { walletAddress: '0x00' }, { walletAddress: '0x01' } ];
      service[ '_tasks' ] = <any> tasks;

      expect(service.tasks).toEqual(<any> tasks);
    });
  });

  describe('#get fileUploadTasks()', () => {
    it('should return task with type FileUploadTask', () => {
      const tasks = [ { taskType: TaskType.UPLOAD }, { taskType: TaskType.DOWNLOAD } ];
      service[ '_tasks' ] = <any> tasks;

      expect(service.fileUploadTasks).toEqual(<any> [ tasks[ 0 ] ]);
    });
  });

  describe('#get foregroundTasks()', () => {
    it('should return all tasks', () => {
      const tasks = [ { walletAddress: walletAddress }, { walletAddress: '0x01' } ];
      service[ 'wallet' ] = wallet;
      service[ '_tasks' ] = <any> tasks;

      expect(service.foregroundTasks).toEqual(<any> [ tasks[ 0 ] ]);
    });
  });

  describe('#addTask()', () => {
    it('should add task to tasks list, run it and call openDialog method', () => {
      service[ 'wallet' ] = wallet;

      const task = {
        run: jasmine.createSpy(),
        finished: true
      };

      service.addTask(<any> task);
      expect(componentInstance.openDialog.calls.count()).toBe(1);
      expect(task.run.calls.count()).toBe(1);
      expect(service.tasks.length).toEqual(1);
    });
  });

  describe('#onTaskEvent()', () => {
    it('should call next on tasksSubject', () => {
      const next = jasmine.createSpy();
      service[ 'tasksSubject' ] = <any> {
        next
      };

      service.openDialog();
      service.onTaskEvent();
      expect(next.calls.count()).toBe(2);
    });
  });

  describe('#openDialog()', () => {
    it('should call open method on dialog object and setTaskManagerService componentInstance', () => {
      service.openDialog();
      expect(componentInstance.setTaskManagerService.calls.count()).toBe(2);
      expect(matDialogSpy.open.calls.count()).toBe(2);
    });
  });

  describe('#hasUnfinishedTasks()', () => {
    it('should return true if at least one task is not finished', () => {
      service[ '_tasks' ] = <any> [ {
        finished: true
      }, {
        finished: false
      }, {
        finished: true
      } ];

      expect(service.hasUnfinishedTasks()).toBeTruthy();
    });

    it('should return false if all tasks are finished', () => {
      service[ '_tasks' ] = <any> [ {
        finished: true
      }, {
        finished: true
      }, {
        finished: true
      } ];

      expect(service.hasUnfinishedTasks()).toBeFalsy();
    });
  });
});
