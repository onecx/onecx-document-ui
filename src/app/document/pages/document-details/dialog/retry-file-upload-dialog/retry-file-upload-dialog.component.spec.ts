import { RetryFileUploadDialogComponent } from './retry-file-upload-dialog.component';

describe('RetryFileUploadDialogComponent', () => {
  let component: RetryFileUploadDialogComponent;

  beforeEach(() => {
    component = new RetryFileUploadDialogComponent();
    component.fileName = 'test.pdf';
  });

  it('should create the component with dialogResult null and showFileNameMismatch false', () => {
    expect(component).toBeTruthy();
    expect(component.dialogResult).toBeNull();
    expect(component.showFileNameMismatch).toBe(false);
  });

  describe('onFileSelected', () => {
    it('should set dialogResult to the provided file when file name matches', () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      component.onFileSelected(mockFile);

      expect(component.dialogResult).toBe(mockFile);
      expect(component.showFileNameMismatch).toBe(false);
    });

    it('should set showFileNameMismatch to true and keep dialogResult null when file name does not match', () => {
      const wrongFile = new File(['content'], 'other.pdf', {
        type: 'application/pdf',
      });

      component.onFileSelected(wrongFile);

      expect(component.showFileNameMismatch).toBe(true);
      expect(component.dialogResult).toBeNull();
    });

    it('should clear showFileNameMismatch when a matching file is selected after a mismatch', () => {
      const wrongFile = new File(['content'], 'other.pdf', {
        type: 'application/pdf',
      });
      const correctFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      component.onFileSelected(wrongFile);
      expect(component.showFileNameMismatch).toBe(true);

      component.onFileSelected(correctFile);

      expect(component.showFileNameMismatch).toBe(false);
      expect(component.dialogResult).toBe(correctFile);
    });
  });
});
