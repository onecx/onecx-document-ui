import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadComponent } from 'src/app/document/components/file-upload/file-upload.component';
import { DocumentQuickUploadFormComponent } from './document-quick-upload-form.component';
import { LifeCycleState } from 'src/app/shared/generated';

describe('DocumentQuickUploadFormComponent', () => {
  let component: DocumentQuickUploadFormComponent;
  let fixture: ComponentFixture<DocumentQuickUploadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentQuickUploadFormComponent, FileUploadComponent],
      imports: [
        ReactiveFormsModule,
        DropdownModule,
        TranslateTestingModule.withTranslations('en', {}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentQuickUploadFormComponent);
    component = fixture.componentInstance;
    component.attachmentArray = [];
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validators on ngOnInit', () => {
    expect(component.documentQuickUploadForm.contains('documentName')).toBe(
      true
    );
    expect(component.documentQuickUploadForm.contains('typeId')).toBe(true);
    expect(component.documentQuickUploadForm.contains('channelname')).toBe(
      true
    );
    expect(
      component.documentQuickUploadForm.get('documentName')!.hasValidator
    ).toBeTruthy();
  });

  it('should set a non-null default lifeCycleState on ngOnInit', () => {
    const lifeCycleState =
      component.documentQuickUploadForm.get('lifeCycleState')!.value;
    expect(lifeCycleState).not.toBeNull();
  });

  it('should emit formValid event when form value changes', () => {
    const emitSpy = jest.spyOn(component.formValid, 'emit');
    component.documentQuickUploadForm.patchValue({ documentName: 'Test' });
    expect(emitSpy).toHaveBeenCalledWith(component.documentQuickUploadForm);
  });

  it('should trim spaces from control value on blur event', () => {
    component.documentQuickUploadForm = new FormGroup({
      controlName: new FormControl('  hello  '),
    });
    const mockEvent = {
      target: { getAttribute: () => 'controlName', value: '  hello  ' },
    } as any;
    component.trimSpace(mockEvent);
    expect(component.documentQuickUploadForm.get('controlName')!.value).toBe(
      'hello'
    );
  });

  it('should call preventDefault on allowDrop event', () => {
    const event = { preventDefault: jest.fn() } as any;
    component.allowDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should prevent space when cursor is at position 0', () => {
    const event = {
      target: { selectionStart: 0 },
      code: 'Space',
      preventDefault: jest.fn(),
    } as any;
    component.preventSpace(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent space when cursor is not at position 0', () => {
    const event = {
      target: { selectionStart: 5 },
      code: 'Space',
      preventDefault: jest.fn(),
    } as any;
    component.preventSpace(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should add file to attachmentArray with valid MIME type', () => {
    component.supportedMimeType = [
      { label: 'application/pdf', value: 'mime-1' },
    ];
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

    component.onFilesSelected([file]);

    expect(component.attachmentArray.length).toBe(1);
    expect(component.attachmentArray[0].mimeTypeId).toBe('mime-1');
    expect(component.attachmentArray[0].isValid).toBe(true);
  });

  it('should mark attachment as invalid when MIME type is not supported', () => {
    component.supportedMimeType = [];
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

    component.onFilesSelected([file]);

    expect(component.attachmentArray[0].isValid).toBe(false);
    expect(component.attachmentArray[0].mimeTypeId).toBeUndefined();
  });

  it('should mark attachment as invalid when file size exceeds 2097152 bytes', () => {
    component.supportedMimeType = [
      { label: 'application/pdf', value: 'mime-1' },
    ];
    const largeFile = {
      name: 'big.pdf',
      size: 3_000_000,
      type: 'application/pdf',
    } as File;

    (component as any).enterDataToListView(largeFile);

    expect(component.attachmentArray[0].isValid).toBe(false);
  });

  it('should emit enableCreateButton=true when all attachments are valid', () => {
    const emitSpy = jest.spyOn(component.enableCreateButton, 'emit');
    component.attachmentArray = [{ isValid: true } as any];
    (component as any).validateAttachmentArray();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should emit enableCreateButton=false when any attachment is invalid', () => {
    const emitSpy = jest.spyOn(component.enableCreateButton, 'emit');
    component.attachmentArray = [{ isValid: true }, { isValid: false }] as any;
    (component as any).validateAttachmentArray();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should emit enableCreateButton=false when attachmentArray is empty', () => {
    const emitSpy = jest.spyOn(component.enableCreateButton, 'emit');
    component.attachmentArray = [];
    (component as any).validateAttachmentArray();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should place invalid attachments before valid ones after sortAttachmentArray', () => {
    component.attachmentArray = [{ isValid: true }, { isValid: false }] as any;
    (component as any).sortAttachmentArray();
    expect(component.attachmentArray[0].isValid).toBe(false);
    expect(component.attachmentArray[1].isValid).toBe(true);
  });

  it('should call trimSpaces with correct args when trimSpaceOnPaste is called', () => {
    const event = {
      clipboardData: { getData: () => ' pasted text' },
      preventDefault: jest.fn(),
    } as any;

    component.trimSpaceOnPaste(event, 'documentName', 255);

    expect(
      component.documentQuickUploadForm.controls['documentName'].value
    ).toBe('pasted text');
  });

  it('should process files from input element when addFile is called with files', () => {
    const emitSpy = jest.spyOn(component.attchmentList, 'emit');
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } } as any;

    component.addFile(event);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not process files when addFile is called with no files', () => {
    const emitSpy = jest.spyOn(component.attchmentList, 'emit');
    const event = { target: { files: null } } as any;

    component.addFile(event);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should process files from dataTransfer when dropFile is called with files', () => {
    const emitSpy = jest.spyOn(component.attchmentList, 'emit');
    const file = new File(['content'], 'drop.pdf', { type: 'application/pdf' });
    const event = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [file] },
    } as any;

    component.dropFile(event);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not process files when dropFile is called with no dataTransfer files', () => {
    const emitSpy = jest.spyOn(component.attchmentList, 'emit');
    const event = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [] },
    } as any;

    component.dropFile(event);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
