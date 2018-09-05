import { TaskManagerService } from './task-manager.service';
import { from } from 'rxjs';
import Wallet from '../shared/models/wallet';
import { TaskType } from '../tasks/task-type';
import BigNumber from 'bignumber.js';

describe('TaskManagerService', () => {
  let walletServiceSpy: { getWallet: jasmine.Spy };
  let service: TaskManagerService;
  const walletAddress = '0x00';
  const wallet = new Wallet(walletAddress, new BigNumber(1));

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));
    service = new TaskManagerService(<any> walletServiceSpy);
    window.addEventListener = () => {
    };
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
    it('should add task to tasks list, run it and call openManager method', () => {
      service[ 'wallet' ] = wallet;

      const task = {
        run: jasmine.createSpy(),
        finished: true
      };

      spyOn(service, 'openManager');

      service.addTask(<any> task);
      expect(service.openManager).toHaveBeenCalled();
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

      service.openManager();
      service.onTaskEvent();
      expect(next.calls.count()).toBe(1);
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
