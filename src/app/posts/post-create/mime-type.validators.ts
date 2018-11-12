import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl
  ): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => {
    if (typeof(control.value) === 'string') {
      return of(null);
    }
    const file = control.value as File;
    const fileReader = new FileReader();
    const frObs = Observable.create((observer: Observer<{[key: string]: any}>) => {
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array(<ArrayBuffer>fileReader.result).subarray(0, 4);
        let header = '';
        for (let i = 0;  i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        let isValid = false;
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false;
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file); // When this done, addEventListener will call the function above
    });
    return frObs;
  };
