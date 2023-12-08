import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { ValidatorImageDTO } from './dtos/validator-image.dto';
import Swal from 'sweetalert2';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';

export abstract class BaseController {
  appName: string;

  constructor(instanceName: string) {
    this.appName = instanceName;
  }

  //Trim Character
  trimString(text: string, length: number): string {
    if (text.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
  }

  //Trim number
  trimNumber(text: number, length: number): string {
    if (text.toString().length > length) {
      return text.toString().substring(0, length);
    }
    return text.toString();
  }

  //Date Format ex : Wednesday, June 28, 2023 at 11:57 PM
  formatDate(updatedAt: string | Date | null): any {
    if (updatedAt != null) {
      const date = new Date(updatedAt);
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      return formattedDate;
    }
    return;
  }

  //Date Format ex : July 27, 2023
  formatDateNotDays(updatedAt: string | Date | null): any {
    if (updatedAt != null) {
      const date = new Date(updatedAt);
      const formattedDate = date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return formattedDate;
    }
    return;
  }

  //Handler
  handleError(error: any): Observable<never> {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: `status: ${error.status} | status text: ${error.statusText} | message: ${error.message}`,
      timer: 5000,
      showConfirmButton: false,
    });
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  //File Validator
  fileValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value as File;
      if (file) {
        const maxSizeInBytes = 1024 * 1024; // 1MB
        if (file.size > maxSizeInBytes) {
          return { maxSizeExceeded: true };
        }
      }
      return null;
    };
  }

  //Image Validation
  async imageValidation(
    image: File,
    maxSize: number
  ): Promise<ValidatorImageDTO> {
    if (image) {
      const sizeMax = maxSize.toString() + '000000';
      if (
        image.type !== 'image/png' &&
        image.type !== 'image/jpeg' &&
        image.type !== 'image/jpg'
      ) {
        const response: ValidatorImageDTO = {
          status: false,
          message: 'File image format must be png, jpg, or jpeg',
        };
        return response;
      }
      if (image.size > Number(sizeMax)) {
        const response: ValidatorImageDTO = {
          status: false,
          message: `File image size must be under ${maxSize} mb`,
        };
        return response;
      }
    }
    const response: ValidatorImageDTO = {
      status: true,
      message: `File Image success!`,
    };
    return response;
  }

  //Vidoe Validation
  async videoValidation(
    video: File,
    maxSize: number
  ): Promise<ValidatorImageDTO> {
    if (video) {
      const sizeMax = maxSize.toString() + '000000';
      if (video.type !== 'video/mp4') {
        const response: ValidatorImageDTO = {
          status: false,
          message: 'File video format must be mp4',
        };
        return response;
      }
      if (video.size > Number(sizeMax)) {
        const response: ValidatorImageDTO = {
          status: false,
          message: `File video size must be under ${maxSize} mb`,
        };
        return response;
      }
    }
    const response: ValidatorImageDTO = {
      status: true,
      message: `File Image success!`,
    };
    return response;
  }

  // Paginated Logic
  paginate(total: number, limit: number, arrayData: Array<number>): void {
    arrayData.splice(0);
    const totalPages = Math.ceil(total / limit);
    for (let i = 0; i < totalPages; i++) {
      arrayData.push(i + 1);
    }
  }

  formatDateNow(date: Date): string {
    // Format the date as "YYYY-MM-DD"
    const dateObj = new Date(date);

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  twoDigits(value: number): string {
    // Helper function to ensure the number has two digits
    return value < 10 ? `0${value}` : value.toString();
  }

  //Capitalize
  capitalizeWords(inputString: string): string {
    if (typeof inputString !== 'string') {
      return '';
    }
    const words = inputString.split(' ');
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return '';
      }
    });
    const resultString = capitalizedWords.join(' ');
    return resultString;
  }

  extensionChecker(file: string): string {
    const parsedURL = new URL(file);
    const path = parsedURL.pathname;
    const parts = path.split('.');
    const extension = parts[parts.length - 1];
    return extension;
  }
}
