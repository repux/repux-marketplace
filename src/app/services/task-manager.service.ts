import { Injectable, OnDestroy } from '@angular/core';
import { Task } from '../tasks/task';
import { MarketplaceTaskManagerComponent } from '../marketplace/marketplace-task-manager/marketplace-task-manager.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { FileUploadTask } from '../tasks/file-upload-task';
import { TaskType } from '../tasks/task-type';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService implements OnDestroy {
  private dialogRef: MatDialogRef<MarketplaceTaskManagerComponent>;
  private wallet: Wallet;
  private tasksSubject = new BehaviorSubject<ReadonlyArray<Task>>([]);
  private foregroundTasksSubject = new BehaviorSubject<ReadonlyArray<Task>>([]);
  private readonly walletSubscription: Subscription;
  private _tasks: Task[] = [];

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService) {
    this.addConfirmationPrompt();
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.openDialog();
  }

  get tasks(): ReadonlyArray<Task> {
    return Object.freeze(Object.assign([], this._tasks));
  }

  get fileUploadTasks(): ReadonlyArray<FileUploadTask> {
    return Object.freeze(Object.assign([], this._tasks.filter(task => task.taskType === TaskType.UPLOAD)));
  }

  get foregroundTasks(): ReadonlyArray<Task> {
    return Object.freeze(Object.assign([], this._tasks.filter(task => task.walletAddress === this.wallet.address)));
  }

  addTask(task: Task) {
    task.run(this);
    this._tasks.push(task);
    this.tasksSubject.next(this.tasks);
    this.foregroundTasksSubject.next(this.foregroundTasks);
    this.dialogRef.componentInstance.openDialog();
  }

  removeTask(task: Task) {
    this._tasks = this._tasks.filter(storedTask => storedTask !== task);
    this.afterTaskRemove();
  }

  afterTaskRemove() {
    this.onTaskEvent();
  }

  onTaskEvent() {
    this.tasksSubject.next(this.tasks);
    this.foregroundTasksSubject.next(this.foregroundTasks);
  }

  openDialog() {
    this.dialogRef = this.dialog.open(MarketplaceTaskManagerComponent, {
      position: {
        left: '20px',
        bottom: '20px'
      },
      hasBackdrop: false,
      disableClose: true,
      panelClass: 'transparent-modal'
    });

    this.dialogRef.componentInstance.setTaskManagerService(this);
    this.tasksSubject.next(this.tasks);
    this.foregroundTasksSubject.next(this.foregroundTasks);

    if (!this.foregroundTasks.length) {
      this.dialogRef.componentInstance.closeDialog();
    }
  }

  hasUnfinishedTasks(): boolean {
    return this._tasks.filter(task => !task.finished).length > 0;
  }

  getTasks(): Observable<ReadonlyArray<Task>> {
    return this.tasksSubject.asObservable();
  }

  getForegroundTasks(): Observable<ReadonlyArray<Task>> {
    return this.foregroundTasksSubject.asObservable();
  }

  ngOnDestroy() {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.foregroundTasksSubject.next(this.foregroundTasks);
    this.afterTaskRemove();
  }

  private addConfirmationPrompt() {
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
