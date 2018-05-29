import { TaskManagerService } from './task-manager.service';
import { TestBed } from '@angular/core/testing';
import { TaskManagerComponent } from '../task-manager/task-manager.component';
import { MatDialogModule } from '@angular/material';

describe('TaskManagerService', () => {
  let matDialogSpy: { search: jasmine.Spy };
  let service: TaskManagerService;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    service = new TaskManagerService(<any> matDialogSpy);
    window.addEventListener = () => {};

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
      expect(service.tasks).toEqual([]);
    });
  });

  describe('#addTask()', () => {
    it('should add task to tasks list, run it and call openDialog method', () => {
      spyOn(service, 'openDialog').and.callFake(function() {
        this._dialogRef = {
          componentInstance: {}
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
    it('should call ngDoCheck on dialogComponent', () => {
      const ngDoCheck = jasmine.createSpy();

      spyOn(service, 'openDialog').and.callFake(function() {
        this._dialogRef = {
          componentInstance: {
            ngDoCheck
          }
        };
      });

      service.openDialog();
      service.onTaskEvent();
      expect(ngDoCheck.calls.count()).toBe(1);
    });

    it('should not call ngDoCheck when dialogRef is undefined', () => {
      const ngDoCheck = jasmine.createSpy();

      spyOn(service, 'openDialog').and.callFake(function() {
        this._dialogRef = {
          componentInstance: {
            ngDoCheck
          }
        };
      });

      service.onTaskEvent();
      expect(ngDoCheck.calls.count()).toBe(0);
    });
  });

  describe('#openDialog()', () => {
    it('should call open method on dialog object and setTaskManagerService componentInstance', () => {
      const setTaskManagerService = jasmine.createSpy();

      const open = jasmine.createSpy().and.returnValue({
        componentInstance: {
          setTaskManagerService
        }
      });
      service['_dialog'].open = open;

      service.openDialog();
      expect(setTaskManagerService.calls.count()).toBe(1);
      expect(open.calls.count()).toBe(1);
    });

    it('should not call open method when _dialogRef is defined', () => {
      service['_dialogRef'] = <any> 'SOME_VALUE';
      const setTaskManagerService = jasmine.createSpy();

      const open = jasmine.createSpy().and.returnValue({
        componentInstance: {
          setTaskManagerService
        }
      });
      service['_dialog'].open = open;

      service.openDialog();
      expect(setTaskManagerService.calls.count()).toBe(0);
      expect(open.calls.count()).toBe(0);
    });
  });

  describe('#closeDialog()', () => {
    it('should call close method on _dialogRef object', () => {
      const close = jasmine.createSpy();
      service['_dialogRef'] = <any> {
        close
      };

      service.closeDialog();
      expect(close.calls.count()).toBe(1);
    });
  });

  describe('#hasUnfinishedTasks()', () => {
    it('should return true if at least one task is not finished', () => {
      service['_tasks'] = <any> [{
        finished: true
      }, {
        finished: false
      }, {
        finished: true
      }];

      expect(service.hasUnfinishedTasks()).toBeTruthy();
    });

    it('should return false if all tasks are finished', () => {
      service['_tasks'] = <any> [{
        finished: true
      }, {
        finished: true
      }, {
        finished: true
      }];

      expect(service.hasUnfinishedTasks()).toBeFalsy();
    });
  });
});
