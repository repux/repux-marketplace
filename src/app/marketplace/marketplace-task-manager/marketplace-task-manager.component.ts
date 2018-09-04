import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Task } from '../../tasks/task';
import { TaskError } from '../../tasks/task-error';
import { TaskManagerService } from '../../services/task-manager.service';

@Component({
  selector: 'app-marketplace-task-manager',
  templateUrl: './marketplace-task-manager.component.html',
  styleUrls: [ './marketplace-task-manager.component.scss' ]
})
export class MarketplaceTaskManagerComponent implements OnInit, OnDestroy {
  tasks: ReadonlyArray<Task> = [];
  taskError = TaskError;
  opened = false;

  private subscriptions: Subscription[] = [];

  constructor(private taskManagerService: TaskManagerService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.taskManagerService.getForegroundTasks().subscribe(tasks => {
        this.tasks = tasks;
      })
    );

    this.subscriptions.push(
      this.taskManagerService.shouldOpenManager().subscribe(() => this.openDialog())
    );
  }

  ngOnDestroy() {
    if (this.subscriptions.length) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptions = [];
    }
  }

  closeDialog() {
    this.opened = false;
  }

  openDialog() {
    this.opened = true;
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter(task => !task.finished);
  }

  removeTask(task: Task) {
    this.taskManagerService.removeTask(task);
  }
}
