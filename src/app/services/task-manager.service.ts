import { Injectable } from '@angular/core';
import { Task } from '../tasks/task';
import { TaskManagerComponent } from '../task-manager/task-manager.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WalletService } from './wallet.service';
import Wallet from '../wallet';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private _tasks: Task[] = [];
  private _dialogRef: MatDialogRef<TaskManagerComponent>;
  private _wallet: Wallet;

  constructor(
    private _dialog: MatDialog,
    private _walletService: WalletService) {
    this._addConfirmationPrompt();
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
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

  get tasks(): ReadonlyArray<Task> {
    return Object.freeze(Object.assign([], this._tasks));
  }

  addTask(task: Task) {
    task.run(this);
    this._tasks.push(task);
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
    if (this._dialogRef) {
      this._dialogRef.componentInstance.ngDoCheck();
    }
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
    this._dialogRef.componentInstance.ngDoCheck();
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

    window.addEventListener('beforeunload', function (event) {
      if (self.hasUnfinishedTasks()) {
        const confirmationMessage = '\o/';

        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
  }
}
