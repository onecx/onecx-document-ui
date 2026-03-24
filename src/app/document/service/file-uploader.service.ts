import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService {
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  uploadAttachment(url: string, file: File): Observable<void> {
    const resolvedUrl = environment.rewriteUploadUrl(url);
    return this.httpClient.put<void>(resolvedUrl, file).pipe(
      retry(3),
      catchError((error) => throwError(() => error))
    );
  }
}
