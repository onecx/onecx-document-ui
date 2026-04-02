import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;

  beforeEach(() => {
    component = new FileUploadComponent();
  });

  describe('allowDrop', () => {
    it('should call preventDefault on dragover event', () => {
      const event = { preventDefault: jest.fn() } as any;
      component.allowDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('onDrop', () => {
    it('should emit filesSelected with dropped files when multiple=true', () => {
      component.multiple = true;
      const emitted: File[][] = [];
      component.filesSelected.subscribe((f) => emitted.push(f));

      const file1 = new File(['a'], 'a.pdf');
      const file2 = new File(['b'], 'b.pdf');
      const event = {
        preventDefault: jest.fn(),
        dataTransfer: { files: [file1, file2] },
      } as any;

      component.onDrop(event);

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toEqual([file1, file2]);
    });

    it('should emit fileSelected with first file when multiple=false', () => {
      component.multiple = false;
      const emitted: File[] = [];
      component.fileSelected.subscribe((f) => emitted.push(f));

      const file = new File(['a'], 'a.pdf');
      const event = {
        preventDefault: jest.fn(),
        dataTransfer: { files: [file] },
      } as any;

      component.onDrop(event);

      expect(emitted).toEqual([file]);
    });

    it('should not emit when dataTransfer has no files', () => {
      const emittedSingle: File[] = [];
      const emittedMultiple: File[][] = [];
      component.fileSelected.subscribe((f) => emittedSingle.push(f));
      component.filesSelected.subscribe((f) => emittedMultiple.push(f));

      const event = {
        preventDefault: jest.fn(),
        dataTransfer: { files: [] },
      } as any;

      component.onDrop(event);

      expect(emittedSingle).toHaveLength(0);
      expect(emittedMultiple).toHaveLength(0);
    });
  });

  describe('onFileInputChange', () => {
    it('should emit filesSelected when multiple=true', () => {
      component.multiple = true;
      const emitted: File[][] = [];
      component.filesSelected.subscribe((f) => emitted.push(f));

      const file = new File(['c'], 'c.pdf');
      const input = { files: [file], value: '' };
      const event = { target: input } as any;

      component.onFileInputChange(event);

      expect(emitted[0]).toEqual([file]);
    });

    it('should emit fileSelected when multiple=false', () => {
      component.multiple = false;
      const emitted: File[] = [];
      component.fileSelected.subscribe((f) => emitted.push(f));

      const file = new File(['c'], 'c.pdf');
      const input = { files: [file], value: 'some/path' };
      const event = { target: input } as any;

      component.onFileInputChange(event);

      expect(emitted).toEqual([file]);
      expect(input.value).toBe('');
    });

    it('should not emit when input has no files', () => {
      const emitted: File[] = [];
      component.fileSelected.subscribe((f) => emitted.push(f));

      const event = { target: { files: [] } } as any;
      component.onFileInputChange(event);

      expect(emitted).toHaveLength(0);
    });
  });
});
