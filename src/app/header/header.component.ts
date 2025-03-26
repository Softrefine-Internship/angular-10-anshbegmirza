import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DialogHelperService } from '../shared/dialog-helper.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private dialog: MatDialog,
    private dialogHelper: DialogHelperService
  ) {}

  openUploadDialog() {
    const dialogRef = this.dialogHelper.openUploadDialog();
    const closed =
      'afterClosed' in dialogRef
        ? dialogRef.afterClosed()
        : dialogRef.afterDismissed();

    // handle dialog after result.
    closed.subscribe((result) => {
      if (result) {
        // console.log('Dialog result:', result);
      }
    });
  }
}
