import { DocumentCreateAttachmentsComponent } from './document-create-attachments.component';

describe('DocumentCreateAttachmentsComponent', () => {
  let component: DocumentCreateAttachmentsComponent;

  const mockMimeTypes = [
    { label: 'application/pdf', value: 'mime-pdf' },
    { label: 'image/png', value: 'mime-png' },
  ];

  beforeEach(() => {
    component = new DocumentCreateAttachmentsComponent();
    component.supportedMimeTypes = mockMimeTypes;
  });

  describe('ngOnInit', () => {
    it('should initialize attachmentForms from input attachments', () => {
      const file = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      });
      component.attachments = [
        {
          name: 'doc.pdf',
          description: null,
          mimeTypeId: 'mime-pdf',
          validForEnd: null,
          fileName: 'doc.pdf',
          file,
        },
      ];

      component.ngOnInit();

      expect(component.attachmentForms.length).toBe(1);
      expect(component.attachmentForms.at(0).controls.name.value).toBe(
        'doc.pdf'
      );
    });

    it('should add files to the files array during init', () => {
      const file = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      });
      component.attachments = [
        {
          name: 'doc.pdf',
          description: null,
          mimeTypeId: 'mime-pdf',
          validForEnd: null,
          fileName: 'doc.pdf',
          file,
        },
      ];

      component.ngOnInit();

      expect(component.files).toHaveLength(1);
      expect(component.files[0]).toBe(file);
    });
  });

  describe('onFileSelected', () => {
    it('should add attachment form entry and file when MIME type is found', () => {
      const file = new File(['content'], 'image.png', { type: 'image/png' });

      component.onFileSelected(file);

      expect(component.attachmentForms.length).toBe(1);
      expect(component.files).toHaveLength(1);
      expect(component.attachmentForms.at(0).controls.mimeTypeId.value).toBe(
        'mime-png'
      );
    });

    it('should emit attachmentMimeTypeNotSupported when MIME type is not found', () => {
      const emitted: string[] = [];
      component.attachmentMimeTypeNotSupported.subscribe((name) =>
        emitted.push(name)
      );
      const file = new File(['content'], 'virus.exe', {
        type: 'application/octet-stream',
      });

      component.onFileSelected(file);

      expect(emitted).toEqual(['virus.exe']);
      expect(component.attachmentForms.length).toBe(0);
    });

    it('should update selectedIndex to last added attachment', () => {
      const file1 = new File(['c1'], 'a.pdf', { type: 'application/pdf' });
      const file2 = new File(['c2'], 'b.png', { type: 'image/png' });
      component.onFileSelected(file1);
      component.onFileSelected(file2);

      expect(component.selectedIndex).toBe(1);
    });
  });

  describe('removeAttachment', () => {
    beforeEach(() => {
      component.onFileSelected(
        new File(['c'], 'a.pdf', { type: 'application/pdf' })
      );
      component.onFileSelected(new File(['c'], 'b.png', { type: 'image/png' }));
    });

    it('should remove form entry and file at given index', () => {
      component.removeAttachment(0);

      expect(component.attachmentForms.length).toBe(1);
      expect(component.files).toHaveLength(1);
      expect(component.files[0].name).toBe('b.png');
    });

    it('should clamp selectedIndex when removed item was the last one', () => {
      component.selectedIndex = 1;
      component.removeAttachment(1);

      expect(component.selectedIndex).toBe(0);
    });
  });

  describe('selectAttachment', () => {
    it('should update selectedIndex', () => {
      component.selectedIndex = 0;
      component.selectAttachment(2);
      expect(component.selectedIndex).toBe(2);
    });
  });

  describe('onBack', () => {
    it('should emit back with current attachment drafts', () => {
      const emitted: any[] = [];
      component.back.subscribe((v) => emitted.push(v));
      const file = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      });
      component.onFileSelected(file);

      component.onBack();

      expect(emitted).toHaveLength(1);
      expect(emitted[0][0].fileName).toBe('doc.pdf');
    });
  });

  describe('onNext', () => {
    it('should emit next with drafts when form is valid and has attachments', () => {
      const emitted: any[] = [];
      component.next.subscribe((v) => emitted.push(v));
      const file = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      });
      component.onFileSelected(file);

      component.onNext();

      expect(emitted).toHaveLength(1);
    });

    it('should not emit next when attachmentForms is empty', () => {
      const emitted: any[] = [];
      component.next.subscribe((v) => emitted.push(v));

      component.onNext();

      expect(emitted).toHaveLength(0);
    });
  });

  describe('isFormValid', () => {
    it('should return false when attachmentForms is empty', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('should return true when all forms are valid and non-empty', () => {
      const file = new File(['content'], 'doc.pdf', {
        type: 'application/pdf',
      });
      component.onFileSelected(file);
      component.attachmentForms.at(0).controls.name.setValue('Test Doc');

      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('selectedForm getter', () => {
    it('should return form at selectedIndex', () => {
      const file = new File(['c'], 'a.pdf', { type: 'application/pdf' });
      component.onFileSelected(file);

      expect(component.selectedForm).toBe(component.attachmentForms.at(0));
    });

    it('should return null when attachmentForms is empty', () => {
      expect(component.selectedForm).toBeNull();
    });
  });

  describe('isFieldInvalid', () => {
    it('should return false when control is valid', () => {
      const file = new File(['c'], 'a.pdf', { type: 'application/pdf' });
      component.onFileSelected(file);
      const form = component.attachmentForms.at(0);
      form.controls.name.setValue('Some Name');
      form.controls.name.markAsTouched();

      expect(component.isFieldInvalid(form, 'name')).toBe(false);
    });

    it('should return false when control does not exist', () => {
      const file = new File(['c'], 'a.pdf', { type: 'application/pdf' });
      component.onFileSelected(file);
      const form = component.attachmentForms.at(0);

      expect(component.isFieldInvalid(form, 'nonExistentField')).toBe(false);
    });
  });
});
