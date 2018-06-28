import { Component, OnDestroy } from '@angular/core';
import { TaskManagerService } from '../services/task-manager.service';
import { Task } from '../tasks/task';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: [ './task-manager.component.scss' ]
})
export class TaskManagerComponent implements OnDestroy {
  tasks: ReadonlyArray<Task> = [];

  private _tasksSubscription: Subscription;
  private _taskManagerService: TaskManagerService;

  get taskManagerService(): TaskManagerService {
    return this._taskManagerService;
  }

  closeDialog() {
    if (this._taskManagerService) {
      this._taskManagerService.closeDialog();
    }
  }

  setTaskManagerService(taskManagerService: TaskManagerService) {
    this._taskManagerService = taskManagerService;

    this._unsubscribeTasks();
    this._tasksSubscription = this._taskManagerService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  ngOnDestroy() {
    this._unsubscribeTasks();
  }

  private _unsubscribeTasks() {
    if (this._tasksSubscription) {
      this._tasksSubscription.unsubscribe();
    }
  }
}
