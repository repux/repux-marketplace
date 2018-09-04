import { Injectable } from '@angular/core';
import { Task } from '../tasks/task';
import { WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { FileUploadTask } from '../tasks/file-upload-task';
import { TaskType } from '../tasks/task-type';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private wallet: Wallet;
  private openManagerComponentSubject = new Subject();
  private tasksSubject = new BehaviorSubject<ReadonlyArray<Task>>([]);
  private foregroundTasksSubject = new BehaviorSubject<ReadonlyArray<Task>>([]);
  private _tasks: Task[] = [];

  constructor(private walletService: WalletService) {
    this.addConfirmationPrompt();
    this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
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

  shouldOpenManager(): Observable<{}> {
    return this.openManagerComponentSubject.asObservable();
  }

  openManager() {
    this.openManagerComponentSubject.next();
  }

  addTask(task: Task) {
    task.run(this);
    this._tasks.push(task);
    this.tasksSubject.next(this.tasks);
    this.foregroundTasksSubject.next(this.foregroundTasks);
    this.openManager();
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

  hasUnfinishedTasks(): boolean {
    return this._tasks.filter(task => !task.finished).length > 0;
  }

  getTasks(): Observable<ReadonlyArray<Task>> {
    return this.tasksSubject.asObservable();
  }

  getForegroundTasks(): Observable<ReadonlyArray<Task>> {
    return this.foregroundTasksSubject.asObservable();
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
