import { Component } from '@angular/core';
import { ImageService } from 'src/app/shared/image.service';
import { Image } from 'src/app/shared/image.model';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './../confirm-dialog/confirm-dialog.component';

import { EditImageDialogComponent } from '../edit-image-dialog/edit-image-dialog.component';

@Component({
  selector: 'app-display-dialog',
  templateUrl: './display-dialog.component.html',
  styleUrls: ['./display-dialog.component.scss'],
})
export class DisplayDialogComponent {
  images: Image[] = [];
  filteredImages: Image[] = [];
  searchTag: string = '';
  sortBy: string = 'sort';
  isLoading = false;
  error: string | null = null;

  extraTags: number = 0;

  constructor(private imageService: ImageService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadImages();
  }

  private loadImages(): void {
    this.isLoading = true;
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

  searchImages(): void {
    this.isLoading = true;
    if (this.searchTag) {
      this.imageService.searchImagesByTag(this.searchTag).subscribe({
        next: (images) => {
          this.filteredImages = images as Image[];
          this.sortImages();
          this.isLoading = false;
          console.log(this.filteredImages);
          console.log(this.searchTag);
        },
        error: (err) => console.error('Search error:', err),
      });
    } else {
      this.filteredImages = [...this.images];
      this.sortImages();
    }
  }

  resetSearch(): void {
    this.searchTag = '';
    this.sortBy = 'sort';
    this.filteredImages = [...this.images];
    this.sortImages();
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
      console.log('No image ID provided.');
      this.error = `No image ID provided.`;
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: image.title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.uploading = true;
        this.imageService
          .deleteImage(image.id)
          .then(() => {
            this.loadImages();
          })
          .catch((error) => {
            this.error = error;
            console.log(error);
          });
      }
    });
  }

  editImage(image: Image): void {
    // console.log('Edit image dialog opened', image);

    const dialogRef = this.dialog.open(EditImageDialogComponent, {
      width: '450px',
      data: {
        image: {
          ...image,
          tags: image.tags || null,
        },
      },
    });

    dialogRef.afterClosed().subscribe((updatedImage) => {
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
