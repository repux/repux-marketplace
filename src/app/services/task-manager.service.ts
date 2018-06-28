import { Injectable } from '@angular/core';
import { Task } from '../tasks/task';
import { TaskManagerComponent } from '../task-manager/task-manager.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WalletService } from './wallet.service';
import Wallet from '../wallet';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private _dialogRef: MatDialogRef<TaskManagerComponent>;
  private _wallet: Wallet;
  private _tasksSubject = new BehaviorSubject<ReadonlyArray<Task>>([]);

  constructor(
    private _dialog: MatDialog,
    private _walletService: WalletService) {
    this._addConfirmationPrompt();
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _tasks: Task[] = [];

  get tasks(): ReadonlyArray<Task> {
    return Object.freeze(Object.assign([], this._tasks));
  }

  addTask(task: Task) {
    task.run(this);
    this._tasks.push(task);
    this._tasksSubject.next(this.tasks);
    this.openDialog();
  }

  removeTask(task: Task) {
    this._tasks = this._tasks.filter(storedTask => storedTask !== task);
    this._afterTaskRemove();
  }

  _afterTaskRemove() {
    this.onTaskEvent();

    if (this._tasks.length === 0) {
      this.closeDialog();
    }
  }

  onTaskEvent() {
    this._tasksSubject.next(this.tasks);
  }

  openDialog() {
    if (this._dialogRef) {
      return;
    }

    this._dialogRef = this._dialog.open(TaskManagerComponent, {
      position: {
        right: '15px',
        bottom: '15px'
      },
      hasBackdrop: false
    });

    this._dialogRef.componentInstance.setTaskManagerService(this);
    this._tasksSubject.next(this.tasks);
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

  getTasks(): Observable<ReadonlyArray<Task>> {
    return this._tasksSubject.asObservable();
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._tasks.filter(task => task.walletSpecific).forEach(task => task.cancel());
    this._tasks = this._tasks.filter(task => !task.walletSpecific);
    this._afterTaskRemove();
  }

  private _addConfirmationPrompt() {
    const self = this;

    window.addEventListener('beforeunload', function (event) {
      if (self.hasUnfinishedTasks()) {
        const confirmationMessage = '\o/';

        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
  }
}
