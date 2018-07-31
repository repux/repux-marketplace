import { Component, OnDestroy } from '@angular/core';
import { TaskManagerService } from '../../../services/task-manager.service';
import { Task } from '../../../tasks/task';
import { Subscription } from 'rxjs/internal/Subscription';
import { TaskError } from '../../../tasks/task-error';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: [ './task-manager.component.scss' ]
})
export class TaskManagerComponent implements OnDestroy {
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
