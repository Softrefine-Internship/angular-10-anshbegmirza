import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-10';

  selectFile: File | null = null;
  base64Image: string | null = null;
  error: string | null = null;
  imagesToDisplay: string[] = [];

  constructor(
    private http: HttpClient,
    private FireStorage: AngularFireStorage,
    private fireDatabase: AngularFireDatabase
  ) {}

  // Convert image to base64 string
  converToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file); // Convert image to base64
    });
  }

  // Handle file selection
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    if (input && input.files) {
      this.selectFile = input.files[0]; // Get the selected file
      if (this.selectFile) {
        // Convert image to base64
        this.base64Image = await this.converToBase64(this.selectFile);
        this.imagesToDisplay.push(this.base64Image); // Add base64 to the display list
        console.log(this.base64Image);
      }
    }
  }

  // Handle upload logic when the user clicks "Upload"
  onUpload(): void {
    if (this.selectFile && this.base64Image) {
      const imageData = {
        name: this.selectFile.name,
        base64: this.base64Image,
        type: this.selectFile.type,
        date: new Date(),
        tags: ['image', 'angular'],
        size: this.selectFile.size,
      };

      // Generate a unique ID for the image
      const imageId = this.fireDatabase.createPushId();

      // Upload the image metadata (including base64 string) to Firebase Realtime Database
      this.fireDatabase
        .list('imagesCollection')
        .set(imageId, imageData)
        .then(() => {
          console.log(imageId, imageData);

          console.log('Image stored as base64 string in Realtime Database.');
        })
        .catch((error) => {
          this.error = error;
          console.log('Error while storing image:', error);
        });
    } else {
      this.error = 'No file selected or image is not ready to upload!';
      console.log(this.error);
    }
  }

  displayImage(): string[] {
    return this.imagesToDisplay;
  }
}
