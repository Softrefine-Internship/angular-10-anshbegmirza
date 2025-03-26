import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver } from '@angular/cdk/layout';
import { EditImageDialogComponent } from '../gallery/edit-image-dialog/edit-image-dialog.component';

import { UploadDialogComponent } from '../gallery/upload-dialog/upload-dialog.component';

import { ConfirmDialogComponent } from '../gallery/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogHelperService {
  private dialog = inject(MatDialog);
  private bottomSheet = inject(MatBottomSheet);
  private breakpointObserver = inject(BreakpointObserver);

  openUploadDialog() {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 768px)');

    if (isMobile) {
      return this.bottomSheet.open(UploadDialogComponent, {
        panelClass: 'mobile-bottom-sheet',
      });
    } else {
      return this.dialog.open(UploadDialogComponent, {
        width: '1000px',
        height: 'max-content',
        data: {},
      });
    }
  }

  openImageEditor(data: { image: any }) {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 768px)');

    if (isMobile) {
      return this.bottomSheet.open(EditImageDialogComponent, {
        data,
        panelClass: 'mobile-bottom-sheet',
      });
    }
    return this.dialog.open(EditImageDialogComponent, {
      data,
      width: 'max-content',
      // maxWidth: '95vw',
    });
  }

  openConfirmDialog(message: string) {
    const isMobile = this.breakpointObserver.isMatched('(max-width: 768px)');

    const data = { message };

    if (isMobile) {
      return this.bottomSheet
        .open(ConfirmDialogComponent, {
          data,
          panelClass: 'mobile-bottom-sheet',
          // width: '300px',
        })
        .afterDismissed();
    } else {
      return this.dialog
        .open(ConfirmDialogComponent, {
          data,
          width: '400px',
        })
        .afterClosed();
    }
  }
}
