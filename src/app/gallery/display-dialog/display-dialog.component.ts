import { Component, OnInit, Injectable } from '@angular/core';
import { ImageService } from 'src/app/shared/image.service';
import { Image } from 'src/app/shared/image.model';
import { MatDialog } from '@angular/material/dialog';

import { DialogHelperService } from 'src/app/shared/dialog-helper.service';

import { take } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-display-dialog',
  templateUrl: './display-dialog.component.html',
  styleUrls: ['./display-dialog.component.scss'],
})
export class DisplayDialogComponent implements OnInit {
  images: Image[] = [];
  filteredImages: Image[] = [];
  searchTag: string = '';
  sortBy: string = 'sort';
  isLoading = false;
  error: string | null = null;

  searchError: string | null = null;

  private searchDebounceTimer: any = null;

  constructor(
    private imageService: ImageService,
    private dialog: MatDialog,
    private dialogHelper: DialogHelperService
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.isLoading = true;
    this.resetSearch();
    this.imageService.getImages().subscribe({
      next: (images) => {
        this.images = images as Image[];
        // console.log(images);

        this.filteredImages = [...this.images];
        this.sortImages();
        this.isLoading = false;
      },
      error: (err) => console.error('Error loading images:', err),
    });
  }

  onSearchInput(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.searchImages();
    }, 500);
  }

  searchImages(): void {
    // console.log('Searching...');
    this.isLoading = true;
    this.searchError = null;

    if (!this.images.length) {
      this.searchError = 'Images not loaded yet.';
      this.isLoading = false;
      return;
    }

    const trimmedTag = this.searchTag.trim();

    if (trimmedTag.length > 0) {
      this.filteredImages = this.searchImagesByTag(trimmedTag.toLowerCase());
      this.isLoading = false;
      // console.log(this.filteredImages);

      if (this.filteredImages.length === 0) {
        // console.log(`No images found with tag: ${this.searchTag}`);

        this.searchError = `No images found with tag: ${this.searchTag}`;
      }
    } else {
      this.filteredImages = [...this.images];
      this.sortImages();
      this.isLoading = false;
    }
  }

  searchImagesByTag(tag: string) {
    return this.images.filter(
      (image) => image.tags && image.tags.includes(tag)
    );
  }

  resetSearch(): void {
    this.searchTag = '';
    this.sortBy = 'sort';
    this.filteredImages = [...this.images];
    this.sortImages();
    if ((this.searchError && this.searchTag === null) || undefined) {
      this.loadImages();
    }
  }

  sortImages(): void {
    switch (this.sortBy) {
      // case 'sort':
      //   this.filteredImages = [...this.images];
      //   break;

      case 'name':
        this.filteredImages.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        this.filteredImages.sort((a, b) => b.uploadDate - a.uploadDate);
        break;
      case 'size':
        this.filteredImages.sort((a, b) => b.size - a.size);
        break;
    }
  }

  deleteImage(image: Image): void {
    if (!image?.id) {
      // console.log('No image ID provided.');
      this.error = `No image ID provided.`;
      return;
    }

    const dialogRef = this.dialogHelper.openConfirmDialog('this image');

    dialogRef.subscribe((result) => {
      if (result) {
        // this.uploading = true;
        this.imageService
          .deleteImage(image.id)
          .then(() => {
            this.loadImages();
          })
          .catch((error) => {
            this.error = error;
            // console.log(error);
          });
      }
    });
  }

  editImage(image: Image): void {
    const dialogRef = this.dialogHelper.openImageEditor({ image });
    const closed =
      'afterClosed' in dialogRef
        ? dialogRef.afterClosed()
        : dialogRef.afterDismissed();

    closed.subscribe((updatedImage: any) => {
      if (updatedImage) {
        this.imageService
          .updateImage(updatedImage)
          .then(() => {
            // Update local image data or refresh list
            const index = this.images.findIndex(
              (img) => img.id === updatedImage.id
            );
            if (index !== -1) {
              this.images[index] = updatedImage;
              this.filteredImages = [...this.images];
            }
          })
          .catch((error) => {
            this.error = error;
            // console.log(error);
          });
      }
    });
  }
}
