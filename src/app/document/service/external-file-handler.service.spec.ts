import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ExternalFileHandlerService } from './external-file-handler.service';

describe('ExternalFileHandlerService', () => {
  let service: ExternalFileHandlerService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExternalFileHandlerService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadAttachment', () => {
    it('should send PUT request to the given URL with the file as body', () => {
      const url = 'https://storage.example.com/upload/123';
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      let completed = false;

      service.uploadAttachment(url, file).subscribe(() => {
        completed = true;
      });

      const req = httpTesting.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(file);
      req.flush(null);
      expect(completed).toBe(true);
    });

    it('should propagate error after all retries are exhausted', (done) => {
      const url = 'https://storage.example.com/upload/fail';
      const file = new File([], 'fail.pdf');

      service.uploadAttachment(url, file).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      // retry(3) means 1 original + 3 retries = 4 total requests
      for (let i = 0; i < 4; i++) {
        const req = httpTesting.expectOne(url);
        req.flush('Server error', { status: 500, statusText: 'Server Error' });
      }
    });
  });

  describe('downloadFile', () => {
    it('should send GET request with blob response type and return the body', (done) => {
      const urlResponse = { url: 'https://storage.example.com/files/doc.pdf' } as any;
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });

      service.downloadFile(urlResponse).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
        done();
      });

      const req = httpTesting.expectOne(urlResponse.url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should propagate download error after all retries are exhausted', (done) => {
      const urlResponse = { url: 'https://storage.example.com/files/missing.pdf' } as any;

      service.downloadFile(urlResponse).subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });

      for (let i = 0; i < 4; i++) {
        const req = httpTesting.expectOne(urlResponse.url);
        req.error(new ProgressEvent('error'));
      }
    });
  });
});
