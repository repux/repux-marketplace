import { Injectable } from '@angular/core';
import { Task } from "../tasks/task";
import { TaskManagerComponent } from "./task-manager.component";
import { MatDialog, MatDialogRef } from "@angular/material";

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private _tasks: Task[] = [];
  private dialogRef: MatDialogRef<TaskManagerComponent>;

  constructor(private dialog: MatDialog) {
    this.addConfirmationPrompt();
  }

  get tasks(): Task[] {
    return this._tasks;
  }

  addTask(task: Task) {
    task.run(this);
    this.tasks.push(task);
    this.openDialog();
  }

  onTaskEvent() {
    if (this.dialogRef) {
      this.dialogRef.componentInstance.ngDoCheck();
    }
  }

  openDialog() {
    if (this.dialogRef) {
      return;
    }

    this.dialogRef = this.dialog.open(TaskManagerComponent, {
      hasBackdrop: false
    });

    this.dialogRef.componentInstance.setTaskManagerService(this);
  }

  closeDialog() {
    this.dialogRef.close();
    this.dialogRef = null;
  }

  hasUnfinishedTasks(): boolean {
    return this._tasks.reduce((acc, task) => acc = !task.finished ? acc + 1 : acc, 0) > 0;
  }

  addConfirmationPrompt() {
    const self = this;

    window.addEventListener('beforeunload', function(event) {
      if (self.hasUnfinishedTasks()) {
        const confirmationMessage = "\o/";

        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
  }
}
