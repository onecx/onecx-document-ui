import {
  addCharacteristic,
  createCharacteristicFormGroup,
  createDocumentDetailsForm,
  createDocumentDetailsSectionForm,
  getAttachmentFormArray,
  getCharacteristicsFormArray,
  patchDocumentDetailsForm,
  removeCharacteristic,
  setAttachmentsOnForm,
  setCharacteristicsOnForm,
} from './document-details-form.factory';

describe('document-details-form.factory', () => {
  describe('createDocumentDetailsSectionForm', () => {
    it('should create a form group with all required controls', () => {
      const form = createDocumentDetailsSectionForm();
      const expected = [
        'name',
        'type',
        'version',
        'channel',
        'specification',
        'status',
        'description',
        'involvement',
        'objectReferenceType',
        'objectReferenceId',
      ];
      expected.forEach((control) => {
        expect(form.contains(control)).toBe(true);
      });
    });

    it('should be invalid when required fields are empty', () => {
      const form = createDocumentDetailsSectionForm();
      expect(form.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      const form = createDocumentDetailsSectionForm();
      form.patchValue({
        name: 'Doc',
        type: 't1',
        channel: 'ch1',
        status: 'Draft',
      });
      expect(form.valid).toBe(true);
    });

    it('should invalidate name when exceeding 255 characters', () => {
      const form = createDocumentDetailsSectionForm();
      form.get('name')!.setValue('x'.repeat(256));
      expect(form.get('name')!.valid).toBe(false);
    });
  });

  describe('createDocumentDetailsForm', () => {
    it('should include attachments and characteristics form arrays', () => {
      const form = createDocumentDetailsForm();
      expect(form.contains('attachments')).toBe(true);
      expect(form.contains('characteristics')).toBe(true);
      expect(form.controls.attachments.length).toBe(0);
      expect(form.controls.characteristics.length).toBe(0);
    });
  });

  describe('patchDocumentDetailsForm', () => {
    it('should patch all detail fields from DocumentDetail', () => {
      const form = createDocumentDetailsForm();
      const details = {
        name: 'My Document',
        type: { id: 't1' },
        documentVersion: '1.0',
        channel: { name: 'email' },
        specification: { id: 'spec-1' },
        lifeCycleState: 'Draft',
        description: 'A description',
        relatedObject: {
          involvement: 'owner',
          objectReferenceType: 'ticket',
          objectReferenceId: 'T-123',
        },
        attachments: [],
        characteristics: [],
      } as any;

      patchDocumentDetailsForm(form, details);

      expect(form.get('name')!.value).toBe('My Document');
      expect(form.get('type')!.value).toBe('t1');
      expect(form.get('version')!.value).toBe('1.0');
      expect(form.get('channel')!.value).toBe('email');
      expect(form.get('specification')!.value).toBe('spec-1');
      expect(form.get('status')!.value).toBe('Draft');
      expect(form.get('description')!.value).toBe('A description');
      expect(form.get('involvement')!.value).toBe('owner');
    });

    it('should populate attachments form array from DocumentDetail', () => {
      const form = createDocumentDetailsForm();
      const details = {
        attachments: [
          {
            id: 'a1',
            name: 'file.pdf',
            fileName: 'file.pdf',
            mimeType: { name: 'application/pdf' },
          },
        ],
        characteristics: [],
      } as any;

      patchDocumentDetailsForm(form, details);

      expect(form.controls.attachments.length).toBe(1);
      expect(form.controls.attachments.at(0).get('id')!.value).toBe('a1');
    });

    it('should populate characteristics form array from DocumentDetail', () => {
      const form = createDocumentDetailsForm();
      const details = {
        attachments: [],
        characteristics: [{ id: 'c1', name: 'color', value: 'red' }],
      } as any;

      patchDocumentDetailsForm(form, details);

      expect(form.controls.characteristics.length).toBe(1);
      expect(form.controls.characteristics.at(0).get('name')!.value).toBe(
        'color'
      );
    });

    it('should handle undefined details without throwing', () => {
      const form = createDocumentDetailsForm();
      expect(() => patchDocumentDetailsForm(form, undefined)).not.toThrow();
    });
  });

  describe('setAttachmentsOnForm', () => {
    it('should clear existing attachments and replace with new ones', () => {
      const form = createDocumentDetailsForm();
      const attachments = [
        { id: 'a1', name: 'file.pdf', mimeType: { name: 'application/pdf' } },
        { id: 'a2', name: 'image.png', mimeType: { name: 'image/png' } },
      ] as any;

      setAttachmentsOnForm(form, attachments);
      expect(form.controls.attachments.length).toBe(2);

      setAttachmentsOnForm(form, [attachments[0]]);
      expect(form.controls.attachments.length).toBe(1);
    });

    it('should clear attachments when empty array passed', () => {
      const form = createDocumentDetailsForm();
      setAttachmentsOnForm(form, [{ id: 'a1' }] as any);
      setAttachmentsOnForm(form, []);
      expect(form.controls.attachments.length).toBe(0);
    });
  });

  describe('setCharacteristicsOnForm', () => {
    it('should clear and repopulate characteristics', () => {
      const form = createDocumentDetailsForm();
      const chars = [{ id: 'c1', name: 'color', value: 'red' }] as any;

      setCharacteristicsOnForm(form, chars);
      expect(form.controls.characteristics.length).toBe(1);

      setCharacteristicsOnForm(form, []);
      expect(form.controls.characteristics.length).toBe(0);
    });
  });

  describe('addCharacteristic', () => {
    it('should append a new empty characteristic form group', () => {
      const form = createDocumentDetailsForm();

      addCharacteristic(form);

      expect(form.controls.characteristics.length).toBe(1);
      expect(form.controls.characteristics.at(0).get('name')!.value).toBeNull();
    });
  });

  describe('removeCharacteristic', () => {
    it('should remove the characteristic at the given index', () => {
      const form = createDocumentDetailsForm();
      setCharacteristicsOnForm(form, [
        { id: 'c1', name: 'color', value: 'red' },
        { id: 'c2', name: 'size', value: 'L' },
      ] as any);

      removeCharacteristic(form, 0);

      expect(form.controls.characteristics.length).toBe(1);
      expect(form.controls.characteristics.at(0).get('name')!.value).toBe(
        'size'
      );
    });
  });

  describe('getAttachmentFormArray', () => {
    it('should return the attachments FormArray from the form', () => {
      const form = createDocumentDetailsForm();
      const arr = getAttachmentFormArray(form);
      expect(arr).toBe(form.controls.attachments);
    });
  });

  describe('getCharacteristicsFormArray', () => {
    it('should return the characteristics FormArray from the form', () => {
      const form = createDocumentDetailsForm();
      const arr = getCharacteristicsFormArray(form);
      expect(arr).toBe(form.controls.characteristics);
    });
  });

  describe('createCharacteristicFormGroup', () => {
    it('should create a group with null values when no characteristic provided', () => {
      const group = createCharacteristicFormGroup();
      expect(group.get('id')!.value).toBeNull();
      expect(group.get('name')!.value).toBeNull();
      expect(group.get('value')!.value).toBeNull();
    });

    it('should pre-populate values from provided characteristic', () => {
      const char = { id: 'c1', name: 'color', value: 'blue' } as any;
      const group = createCharacteristicFormGroup(char);
      expect(group.get('id')!.value).toBe('c1');
      expect(group.get('name')!.value).toBe('color');
      expect(group.get('value')!.value).toBe('blue');
    });

    it('should be invalid when name and value are empty', () => {
      const group = createCharacteristicFormGroup();
      expect(group.valid).toBe(false);
    });

    it('should be valid when name and value are provided', () => {
      const group = createCharacteristicFormGroup({
        id: null,
        name: 'color',
        value: 'red',
      } as any);
      expect(group.valid).toBe(true);
    });

    it('should invalidate name when exceeding 255 characters', () => {
      const group = createCharacteristicFormGroup({
        name: 'x'.repeat(256),
        value: 'val',
      } as any);
      expect(group.get('name')!.valid).toBe(false);
    });
  });

  describe('createAttachmentFormGroup (via setAttachmentsOnForm)', () => {
    it('should populate attachment form group fields when all attachment properties are present', () => {
      const form = createDocumentDetailsForm();
      const attachment = {
        id: 'att-1',
        name: 'doc.pdf',
        description: 'A description',
        fileName: 'doc.pdf',
        type: 'application/pdf',
        size: 1024,
        sizeUnit: 'KB',
        mimeType: { name: 'application/pdf' },
        storageUploadStatus: true,
      } as any;

      setAttachmentsOnForm(form, [attachment]);

      const group = getAttachmentFormArray(form).at(0);
      expect(group.get('id')!.value).toBe('att-1');
      expect(group.get('name')!.value).toBe('doc.pdf');
      expect(group.get('description')!.value).toBe('A description');
      expect(group.get('mimeTypeName')!.value).toBe('application/pdf');
      expect(group.get('storageUploadStatus')!.value).toBe(true);
    });

    it('should use null fallback for attachment form group when properties are undefined', () => {
      const form = createDocumentDetailsForm();
      const attachment = {} as any;

      setAttachmentsOnForm(form, [attachment]);

      const group = getAttachmentFormArray(form).at(0);
      expect(group.get('id')!.value).toBeNull();
      expect(group.get('name')!.value).toBeNull();
      expect(group.get('mimeTypeName')!.value).toBeNull();
      expect(group.get('storageUploadStatus')!.value).toBe(false);
    });
  });
});
