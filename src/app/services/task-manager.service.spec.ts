import { TaskManagerService } from './task-manager.service';
import { TestBed } from '@angular/core/testing';
import { TaskManagerComponent } from '../shared/components/task-manager/task-manager.component';
import { MatDialogModule } from '@angular/material';
import { from } from 'rxjs';
import Wallet from '../shared/models/wallet';

describe('TaskManagerService', () => {
  let matDialogSpy: { open: jasmine.Spy },
    walletServiceSpy: { getWallet: jasmine.Spy };
  let service: TaskManagerService;
  const walletAddress = '0x00';
  const wallet = new Wallet(walletAddress, 1);

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    service = new TaskManagerService(<any> matDialogSpy, <any> walletServiceSpy);
    window.addEventListener = () => {
    };

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: TaskManagerComponent, useValue: {} }
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

      spyOn(service, 'openDialog').and.callFake(function () {
        const ngDoCheck = jasmine.createSpy();
        this.dialogRef = {
          componentInstance: {
            ngDoCheck
          },
          close: jasmine.createSpy()
        };
      });

      const task = {
        run: jasmine.createSpy(),
        finished: true
      };

      service.addTask(<any> task);
      expect((<jasmine.Spy> service.openDialog).calls.count()).toBe(1);
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

      spyOn(service, 'openDialog').and.callFake(function () {
        this.dialogRef = {
          close: jasmine.createSpy()
        };
      });

      service.openDialog();
      service.onTaskEvent();
      expect(next.calls.count()).toBe(1);
    });
  });

  describe('#openDialog()', () => {
    it('should call open method on dialog object and setTaskManagerService componentInstance', () => {
      const setTaskManagerService = jasmine.createSpy();

      const open = jasmine.createSpy().and.returnValue({
        componentInstance: {
          setTaskManagerService
        },
        close: jasmine.createSpy()
      });
      service[ 'dialog' ].open = open;
      service[ 'closeDialog' ] = jasmine.createSpy();

      service.openDialog();
      expect(setTaskManagerService.calls.count()).toBe(1);
      expect(open.calls.count()).toBe(1);
    });

    it('should not call open method when dialogRef is defined', () => {
      const ngDoCheck = jasmine.createSpy();
      service[ 'dialogRef' ] = <any> {
        componentInstance: {
          ngDoCheck
        },
        close: jasmine.createSpy()
      };
      const setTaskManagerService = jasmine.createSpy();

      const open = jasmine.createSpy().and.returnValue({
        componentInstance: {
          setTaskManagerService
        },
        close: jasmine.createSpy()
      });
      service[ 'dialog' ].open = open;
      service[ 'closeDialog' ] = jasmine.createSpy();

      service.openDialog();
      expect(setTaskManagerService.calls.count()).toBe(0);
      expect(open.calls.count()).toBe(0);
    });
  });

  describe('#closeDialog()', () => {
    it('should call close method on dialogRef object', () => {
      const ngDoCheck = jasmine.createSpy();
      const close = jasmine.createSpy();
      service[ 'dialogRef' ] = <any> {
        componentInstance: {
          ngDoCheck
        },
        close
      };

      service.closeDialog();
      expect(close.calls.count()).toBe(1);
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
