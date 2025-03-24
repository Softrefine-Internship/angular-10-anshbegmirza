import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ImageService } from 'src/app/shared/image.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
})
export class UploadDialogComponent {
  selectedFile: File | null = null;
  base64Image: string | null = null;
  error: string | null = null;
  tags: string[] = [];
  newTag: string = '';

  uploading: boolean = false;
  isDragging = false;
  formSubmitted = false;
  tagsTouched = false;

  imageData = {
    title: '',
    description: '',
    tags: [] as string[],
    uploadDate: 0,
    size: 0,
    base64: '',
    url: '',
    id: '',
  };

  constructor(
    private imageService: ImageService,
    private dialogRef: MatDialogRef<UploadDialogComponent>
  ) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.handleFileSelection(input.files[0]);
    }
  }

  async handleFileSelection(file: File): Promise<void> {
    //formate check
    if (!file.type.match('image.*')) {
      this.error = 'Only image files are allowed (JPEG, PNG, etc.)';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      this.error = 'Image size must be less than 5MB';
      return;
    }

    this.selectedFile = file;
    try {
      this.base64Image = await this.convertToBase64(file);
      this.error = null;
    } catch (error) {
      this.error = 'Error processing image';
      console.error(error);
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  addTag(event: Event): void {
    event.preventDefault();
    if (this.newTag.trim() && !this.tags.includes(this.newTag.trim())) {
      this.tags.push(this.newTag.trim());
      this.newTag = '';
      this.tagsTouched = true;
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.tagsTouched = true;
  }

  onUpload(): void {
    this.formSubmitted = true;

    if (!this.selectedFile) {
      this.error = 'Please select an image file';
      return;
    }

    if (
      !this.imageData.title ||
      !this.imageData.description ||
      this.tags.length < 3
    ) {
      this.error = 'Please add atleast 3 tags, title and description';
      return; // Angular forms will show validation messages
    }

    if (this.selectedFile && this.base64Image) {
      this.uploading = true;
      this.imageData.tags = this.tags;
      this.imageData.uploadDate = Date.now();
      this.imageData.size = this.selectedFile.size;
      this.imageData.base64 = this.base64Image;

      this.imageService
        .uploadImage(this.imageData)
        .then(() => {
          this.uploading = false;
          this.dialogRef.close({
            success: true,
            message: 'Image uploaded successfully!',
          });
        })
        .catch((err) => {
          this.uploading = false;
          this.error = err.message || 'Error uploading image';
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Drag-and-drop methods
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
}
