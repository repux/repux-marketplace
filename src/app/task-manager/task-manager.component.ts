import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskManagerComponent implements OnInit, DoCheck, OnChanges {
  @Input() public taskManagerService = null;
  private lastStatus = [];

  constructor(
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<TaskManagerComponent>
  ) { }

  ngOnInit() {
    this.dialogRef.updatePosition({
      right: '15px',
      bottom: '15px'
    });
  }

  ngOnChanges() {
    for(let i = 0; i < this.taskManagerService.tasks.length; i++) {
      this.lastStatus[i] = {
        progress: this.taskManagerService.tasks[i].progress,
        errors: this.taskManagerService.tasks[i].errors,
        status: this.taskManagerService.tasks[i].status
      }
    }
  }

  ngDoCheck() {
    if (this.lastStatus.length !== this.taskManagerService.tasks.length) {
      this.cd.markForCheck();
      return this.cd.detectChanges();
    }

    for(let i = 0; i < this.taskManagerService.tasks.length; i++) {
      if (!this.lastStatus[i] ||
          this.lastStatus[i].status !== this.taskManagerService.tasks[i].status ||
          this.lastStatus[i].progress !== this.taskManagerService.tasks[i].progress ||
          this.lastStatus[i].errors.length !== this.taskManagerService.tasks[i].errors.length) {
        this.cd.markForCheck();
        return this.cd.detectChanges();
      }
    }
  }

  closeDialog() {
    this.taskManagerService.closeDialog();
  }

  setTaskManagerService(taskManagerService: any) {
    this.taskManagerService = taskManagerService;
  }
}
