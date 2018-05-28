import { Injectable } from '@angular/core';
import { Task } from '../tasks/task';
import { TaskManagerComponent } from './task-manager.component';
import { MatDialog, MatDialogRef } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private _tasks: Task[] = [];
  private _dialogRef: MatDialogRef<TaskManagerComponent>;

  constructor(private _dialog: MatDialog) {
    this._addConfirmationPrompt();
  }

  get tasks(): ReadonlyArray<Task> {
    return Object.freeze(this._tasks);
  }

  addTask(task: Task) {
    task.run(this);
    this._tasks.push(task);
    this.openDialog();
  }

  onTaskEvent() {
    if (this._dialogRef) {
      this._dialogRef.componentInstance.ngDoCheck();
    }
  }

  openDialog() {
    if (this._dialogRef) {
      return;
    }

    this._dialogRef = this._dialog.open(TaskManagerComponent, {
      hasBackdrop: false
    });

    this._dialogRef.componentInstance.setTaskManagerService(this);
  }

  closeDialog() {
    if (!this._dialogRef) {
      return;
    }

    this._dialogRef.close();
    this._dialogRef = null;
  }

  hasUnfinishedTasks(): boolean {
    return this._tasks.filter(task => !task.finished).length > 0;
  }

  private _addConfirmationPrompt() {
    const self = this;

    window.addEventListener('beforeunload', function(event) {
      if (self.hasUnfinishedTasks()) {
        const confirmationMessage = '\o/';

        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
  }
}
