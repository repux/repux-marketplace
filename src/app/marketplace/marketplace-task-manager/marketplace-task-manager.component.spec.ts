import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceTaskManagerComponent } from './marketplace-task-manager.component';
import { Component, Input } from '@angular/core';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { DataProduct } from '../../shared/models/data-product';
import { Task } from '../../tasks/task';
import { MaterialModule } from '../../material.module';
import { TaskManagerService } from '../../services/task-manager.service';
import { of } from 'rxjs';

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
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [
      'removeTask',
      'getForegroundTasks',
      'shouldOpenManager',
      'openManager'
    ]);
    taskManagerService.getForegroundTasks.and.returnValue(of(tasks));
    taskManagerService.shouldOpenManager.and.returnValue(of());

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceTaskManagerComponent,
        MarketplaceActionButtonsStubComponent
      ],
      imports: [
        MaterialModule
      ],
      providers: [
        { provide: TaskManagerService, useValue: taskManagerService }
      ]
    }).compileComponents();
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

  describe('#removeTask()', () => {
    it('should call taskManagerService.removeTask', () => {
      const task = {} as Task;
      component.removeTask(task);
      expect(taskManagerService.removeTask.calls.count()).toBe(1);
    });
  });
});
