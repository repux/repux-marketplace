import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-incentive-dialog',
  templateUrl: './incentive-dialog.component.html',
  styleUrls: ['./incentive-dialog.component.scss']
})
export class IncentiveDialogComponent {
  static storageKey = 'dialog_promotion_dismissed';

  constructor(
    private dialogRef: MatDialogRef<IncentiveDialogComponent>,
    private storageService: StorageService,
    private router: Router) { }

  proceed() {
    this.dismiss();
    this.router.navigate(['/incentive']);
  }

  dismiss() {
    this.storageService.setItem(IncentiveDialogComponent.storageKey, 1);
    this.dialogRef.close();
  }
}
