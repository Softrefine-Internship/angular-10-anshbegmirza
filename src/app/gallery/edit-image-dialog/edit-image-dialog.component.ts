import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Image } from 'src/app/shared/image.model';

@Component({
  selector: 'app-edit-image-dialog',
  templateUrl: './edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.scss'],
})
export class EditImageDialogComponent {
  tags: string[] = [];
  newTag = '';
  title: string = '';
  description: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: Image | null }
  ) {
    // console.log(data);

    // console.log(data.image);

    // Initialize data from image.
    this.tags = data?.image?.tags ? [...data.image.tags] : [];
    this.title = data?.image?.title || '';
    this.description = data?.image?.description || '';
  }

  addTag(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && this.newTag.trim()) {
      if (!this.tags.includes(this.newTag.trim())) {
        this.tags.push(this.newTag.trim());
        this.newTag = '';
      }
      event.preventDefault();
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  saveChanges(): void {
    if (!this.data.image) {
      this.dialogRef.close();
      return;
    }

    this.dialogRef.close({
      ...this.data.image,
      tags: this.tags,
    });
  }
}
