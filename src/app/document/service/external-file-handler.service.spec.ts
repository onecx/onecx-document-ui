import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExternalFileHandlerService } from './external-file-handler.service';

describe('ExternalFileHandlerService', () => {
  let service: ExternalFileHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ExternalFileHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
