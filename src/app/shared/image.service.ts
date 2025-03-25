import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Image } from './image.model';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private db: AngularFireDatabase) {}

  error = null;

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // upload image to firebase database.
  uploadImage(image: Image): Promise<void> {
    const imageId = this.db.createPushId();
    image.id = imageId;

    return this.db
      .list('imagesCollection')
      .set(imageId, image)
      .then(() => {
        // console.log(imageId, image);
        // console.log('Image stored as base64 string in Realtime Database.');
      });
  }

  //fetch images to show em
  getImages() {
    return this.db.list('imagesCollection').valueChanges();
  }

  // searching implementation using tags.
  // searchImagesByTag(tag: string) {
  //   return this.db
  //     .list('imagesCollection', (ref) =>
  //       ref
  //         .orderByChild('tags')

  //         .equalTo(tag)
  //     )
  //     .valueChanges();
  // }

  searchImagesByTag(tag: string) {
    return this.db
      .list('imagesCollection')
      .valueChanges()
      .pipe(
        map((images: any[]) =>
          images.filter((image) => image.tags && image.tags.includes(tag))
        )
      );
  }

  // delete image
  deleteImage(imageId: string): Promise<void> {
    if (!imageId) {
      return Promise.reject('No Image ID was provided.');
    }

    return this.db
      .object(`imagesCollection/${imageId}`)
      .remove()
      .then(() => {
        // console.log('Image deleted successfully', imageId);
      })
      .catch((error) => {
        // console.log('Error deleting image:', error);
        throw (error: any) => error;
      });
  }

  // update image
  updateImage(image: Image): Promise<void> {
    if (!image.id) {
      return Promise.reject('No Image ID was provided.');
    }

    return this.db.object(`imagesCollection/${image.id}`).update({
      tags: image.tags,
      title: image.title,
      description: image.description,
      base64: image.base64,
    });
  }
}
