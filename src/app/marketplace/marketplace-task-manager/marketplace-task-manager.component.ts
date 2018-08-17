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
  opened = true;

  private tasksSubscription: Subscription;
  private _taskManagerService: TaskManagerService;

  get taskManagerService(): TaskManagerService {
    return this._taskManagerService;
  }

  closeDialog() {
    this.opened = false;
  }

  openDialog() {
    this.opened = true;
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

  removeTask(task: Task) {
    this._taskManagerService.removeTask(task);
  }

  private unsubscribeTasks() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }
}
