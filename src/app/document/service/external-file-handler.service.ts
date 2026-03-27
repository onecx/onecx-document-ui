import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { AttachmentPresignedUrlResponse } from 'src/app/shared/generated';

@Injectable({
  providedIn: 'root',
})
export class ExternalFileHandlerService {
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  uploadAttachment(url: string, file: File): Observable<void> {
    console.log(file);
    return this.httpClient.put<void>(url, file).pipe(
      retry(3),
      catchError((error) => throwError(() => error))
    );
  }

  downloadFile(urlResponse: AttachmentPresignedUrlResponse): Observable<Blob> {
    return this.httpClient.get(urlResponse.url!, {observe: 'response', responseType: 'blob'})
    .pipe(
      retry(3),
      map((response) => response.body!)
    );
  }
}
