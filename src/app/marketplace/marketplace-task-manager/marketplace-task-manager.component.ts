import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Task } from '../../tasks/task';
import { TaskError } from '../../tasks/task-error';
import { TaskManagerService } from '../../services/task-manager.service';

@Component({
  selector: 'app-marketplace-task-manager',
  templateUrl: './marketplace-task-manager.component.html',
  styleUrls: [ './marketplace-task-manager.component.scss' ]
})
export class MarketplaceTaskManagerComponent implements OnDestroy {
  tasks: ReadonlyArray<Task> = [];

  taskError = TaskError;

  private tasksSubscription: Subscription;
  private _taskManagerService: TaskManagerService;

  get taskManagerService(): TaskManagerService {
    return this._taskManagerService;
  }

  closeDialog() {
    if (this.taskManagerService) {
      this.taskManagerService.closeDialog();
    }
  }

  setTaskManagerService(taskManagerService: TaskManagerService) {
    this._taskManagerService = taskManagerService;

    this.unsubscribeTasks();
    this.tasksSubscription = this.taskManagerService.getForegroundTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  ngOnDestroy() {
    this.unsubscribeTasks();
  }

  private unsubscribeTasks() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }
}
