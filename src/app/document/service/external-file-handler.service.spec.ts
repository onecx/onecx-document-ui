import { ExternalFileHandlerService } from './external-file-handler.service';
import { TestBed } from '@angular/core/testing';


describe('FileUploaderService', () => {
  let service: ExternalFileHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalFileHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
