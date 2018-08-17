import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceTaskManagerComponent } from './marketplace-task-manager.component';
import { Component, Input } from '@angular/core';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { DataProduct } from '../../shared/models/data-product';
import { Task } from '../../tasks/task';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-marketplace-action-buttons',
  template: ''
})
class MarketplaceActionButtonsStubComponent {
  @Input() availableActions: ActionButtonType[];
  @Input() dataProduct: DataProduct;
}

describe('MarketplaceTaskManagerComponent', () => {
  let taskManagerService;
  let component: MarketplaceTaskManagerComponent;
  let fixture: ComponentFixture<MarketplaceTaskManagerComponent>;
  const tasks = [ 'TASK' ];

  beforeEach(async(() => {
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'removeTask', 'getForegroundTasks' ]);
    taskManagerService.getForegroundTasks.and.returnValue({
      subscribe(callback) {
        callback(tasks);
      }
    });
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceTaskManagerComponent,
        MarketplaceActionButtonsStubComponent
      ],
      imports: [
        MaterialModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceTaskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#closeDialog()', () => {
    it('should set opened to false', () => {
      component.opened = true;
      component.closeDialog();
      expect(component.opened).toBe(false);
    });
  });

  describe('#openDialog()', () => {
    it('should set opened to true', () => {
      component.opened = false;
      component.openDialog();
      expect(component.opened).toBe(true);
    });
  });

  describe('#removeTask()', () => {
    it('should call taskManagerService.removeTask', () => {
      const task = { progress: 100 } as Task;
      component.setTaskManagerService(taskManagerService);

      component.removeTask(task);

      expect(taskManagerService.removeTask.calls.count()).toBe(1);
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
