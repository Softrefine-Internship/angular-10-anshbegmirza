import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  isBottomSheet = false;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Optional()
    private bottomSheetRef: MatBottomSheetRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() dialogData: { message: string },
    @Inject(MAT_BOTTOM_SHEET_DATA)
    @Optional()
    bottomSheetData: { message: string }
  ) {
    this.isBottomSheet = !!bottomSheetRef;
    this.data = dialogData || bottomSheetData;
  }
  data: { message: string };

  onConfirm() {
    this.isBottomSheet
      ? this.bottomSheetRef.dismiss(true)
      : this.dialogRef.close(true);
  }

  onCancel() {
    this.isBottomSheet ? this.bottomSheetRef.dismiss() : this.dialogRef.close();
  }
}
