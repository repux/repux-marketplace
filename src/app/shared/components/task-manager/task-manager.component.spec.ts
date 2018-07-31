import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskManagerComponent } from './task-manager.component';
import { MatDialogModule, MatIconModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';

describe('TaskManagerComponent', () => {
  let taskManagerService;
  let component: TaskManagerComponent;
  let fixture: ComponentFixture<TaskManagerComponent>;
  const tasks = [ 'TASK' ];

  beforeEach(async(() => {
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'closeDialog', 'getForegroundTasks' ]);
    taskManagerService.getForegroundTasks.and.returnValue({
      subscribe(callback) {
        callback(tasks);
      }
    });
    TestBed.configureTestingModule({
      declarations: [ TaskManagerComponent ],
      imports: [
        MatIconModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatDialogModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#closeDialog()', () => {
    it('should call taskManagerService.closeDialog method', () => {
      component[ '_taskManagerService' ] = taskManagerService;
      component.closeDialog();
      expect(taskManagerService.closeDialog.calls.count()).toBe(1);
    });
  });

  describe('#setTaskMangerService()', () => {
    it('should set taskManagerService', () => {
      const unsubscribeTasks = jasmine.createSpy();
      component[ 'unsubscribeTasks' ] = unsubscribeTasks;
      component.setTaskManagerService(taskManagerService);
      expect(component.taskManagerService).toBe(taskManagerService);
      expect(component.tasks).toEqual(<any> tasks);
      expect(unsubscribeTasks.calls.count()).toBe(1);
    });
  });

  describe('#unsubscribeTasks()', () => {
    it('should call unsubscribe when there is subscription', () => {
      const unsubscribe = jasmine.createSpy();
      component[ 'tasksSubscription' ] = <any> {
        unsubscribe
      };
      component[ 'unsubscribeTasks' ]();
      expect(unsubscribe.calls.count()).toBe(1);
    });
  });
});
