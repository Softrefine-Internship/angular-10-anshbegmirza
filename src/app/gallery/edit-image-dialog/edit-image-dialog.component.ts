import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Image } from 'src/app/shared/image.model';
import { ImageService } from 'src/app/shared/image.service';

@Component({
  selector: 'app-edit-image-dialog',
  templateUrl: './edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.scss'],
})
export class EditImageDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  tags: string[] = [];
  newTag = '';
  title = '';
  description = '';

  uploading = false;
  isDragging = false;
  error: string | null = null;

  selectedFile: File | null = null;
  base64Image: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: Image | null },
    private imageService: ImageService
  ) {
    // Initialize data from image if editing
    if (data.image) {
      this.tags = data.image.tags ? [...data.image.tags] : [];
      this.title = data.image.title || '';
      this.description = data.image.description || '';
      this.base64Image = data.image.url || null;
    }
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

  async saveChanges(): Promise<void> {
    this.error = null;

    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    if (this.selectedFile && !this.base64Image) {
      this.error = 'Error processing image';
      return;
    }

    this.uploading = true;

    try {
      const result = {
        ...(this.data.image || {}),
        title: this.title,
        description: this.description,
        tags: this.tags,
        file: this.selectedFile,
        base64: this.base64Image,
        // url: this.base64Image || this.data.image?.url,
      };
      console.log(result);

      this.dialogRef.close(result);
    } catch (err) {
      this.error = 'Error saving changes';
      console.error(err);
    } finally {
      this.uploading = false;
    }
  }

  // File handling methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  async onFileDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      await this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.handleFileSelection(input.files[0]);
    }
  }

  async handleFileSelection(file: File): Promise<void> {
    // Format check
    if (!file.type.match('image.*')) {
      this.error = 'Only image files are allowed (JPEG, PNG, etc.)';
      return;
    }

    this.selectedFile = file;
    try {
      this.base64Image = await this.imageService.convertToBase64(file);
      this.error = null;
    } catch (error) {
      this.error = 'Error processing image';
      console.error(error);
    }
  }
}
