import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  OnChanges,
  OnInit
} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { TaskManagerService } from '../services/task-manager.service';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: [ './task-manager.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskManagerComponent implements OnInit, DoCheck, OnChanges {
  private _lastStatus = [];
  private _taskManagerService: TaskManagerService = <any> {
    tasks: [],
    closeDialog: () => {
    }
  };

  constructor(
    private _cd: ChangeDetectorRef,
    private _dialogRef: MatDialogRef<TaskManagerComponent>
  ) {
  }

  ngOnInit() {
    this._dialogRef.updatePosition({
      right: '15px',
      bottom: '15px'
    });
  }

  ngOnChanges() {
    for (let i = 0; i < this._taskManagerService.tasks.length; i++) {
      this._lastStatus[i] = {
        progress: this._taskManagerService.tasks[i].progress,
        errors: this._taskManagerService.tasks[i].errors,
        status: this._taskManagerService.tasks[i].status
      };
    }
  }

  ngDoCheck() {
    if (this._lastStatus.length !== this._taskManagerService.tasks.length) {
      this._cd.markForCheck();
      return this._cd.detectChanges();
    }

    for (let i = 0; i < this._taskManagerService.tasks.length; i++) {
      if (!this._lastStatus[i] ||
          this._lastStatus[i].status !== this._taskManagerService.tasks[i].status ||
          this._lastStatus[i].progress !== this._taskManagerService.tasks[i].progress ||
          this._lastStatus[i].errors.length !== this._taskManagerService.tasks[i].errors.length) {
        this._cd.markForCheck();
        return this._cd.detectChanges();
      }
    }
  }

  closeDialog() {
    this._taskManagerService.closeDialog();
  }

  setTaskManagerService(taskManagerService: TaskManagerService) {
    this._taskManagerService = taskManagerService;
  }

  get taskManagerService(): TaskManagerService {
    return this._taskManagerService;
  }
}
