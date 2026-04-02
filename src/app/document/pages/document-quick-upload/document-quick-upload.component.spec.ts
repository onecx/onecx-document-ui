import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  PortalCoreModule,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DataViewModule } from 'primeng/dataview';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { DocumentQuickUploadFormComponent } from './document-quick-upload-form/document-quick-upload-form.component';
import { documentQuickUploadSelectors } from './document-quick-upload.selectors';
import { DocumentQuickUploadComponent } from './document-quick-upload.component';
import { initialState } from './document-quick-upload.reducers';
import { PrimeIcons } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DocumentQuickUploadComponent', () => {
  let component: DocumentQuickUploadComponent;
  let fixture: ComponentFixture<DocumentQuickUploadComponent>;
  let store: MockStore<Store>;
  let router: Router;

  const mockActivatedRoute = { snapshot: { data: {} } };

  /* eslint-disable @typescript-eslint/no-var-requires */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DocumentQuickUploadComponent,
        DocumentQuickUploadFormComponent,
        FileUploadComponent,
      ],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
        DropdownModule,
        DataViewModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../assets/i18n/en.json')
        ),
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMockStore({
          initialState: { document: { quickUpload: initialState } },
        }),
        BreadcrumbService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideAppStateServiceMock(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    store.overrideSelector(
      documentQuickUploadSelectors.selectOptionsLoading,
      false
    );
    store.refreshState();

    fixture = TestBed.createComponent(DocumentQuickUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls on ngOnInit', () => {
    expect(component.documentQuickUploadForm.contains('documentName')).toBe(
      true
    );
    expect(component.documentQuickUploadForm.contains('typeId')).toBe(true);
    expect(component.documentQuickUploadForm.contains('channelname')).toBe(
      true
    );
    expect(component.documentQuickUploadForm.contains('lifeCycleState')).toBe(
      true
    );
  });

  it('should sync isSubmitted with selectOptionsLoading from store', () => {
    store.overrideSelector(
      documentQuickUploadSelectors.selectOptionsLoading,
      true
    );
    store.refreshState();
    fixture.detectChanges();

    expect(component.isSubmitted).toBe(true);
  });

  it('should update layout when updateAttachmentsLayout is called', () => {
    component.updateAttachmentsLayout('list');
    expect(component.layout).toBe('list');
  });

  it('should set enableCreateButton when createButtonEnable is called', () => {
    component.createButtonEnable(true);
    expect(component.enableCreateButton).toBe(true);

    component.createButtonEnable(false);
    expect(component.enableCreateButton).toBe(false);
  });

  it('should set formValid and documentQuickUploadForm when setFormValid is called', () => {
    const mockForm = component.documentQuickUploadForm;
    component.setFormValid(mockForm);
    expect(component.formValid).toBe(mockForm.valid);
    expect(component.documentQuickUploadForm).toBe(mockForm);
  });

  it('should set attachmentArray when setAttachmentArray is called', () => {
    const attachments = [{ name: 'file.pdf', isValid: true } as any];
    component.setAttachmentArray(attachments);
    expect(component.attachmentArray).toBe(attachments);
  });

  it('should set sortField and trigger updateSorting on onSortFieldChange', () => {
    component.onSortFieldChange('fileName');
    expect(component.sortField).toBe('fileName');
  });

  it('should set sortOrder=−1 when sorting fileData.name in ASCENDING', () => {
    component.sortField = 'fileData.name';
    component.onSortOrderChange(true);
    expect(component.sortOrder).toBe(-1);
  });

  it('should set sortOrder=1 when sorting fileData.name in DESCENDING', () => {
    component.sortField = 'fileData.name';
    component.onSortOrderChange(false);
    expect(component.sortOrder).toBe(1);
  });

  it('should dispatch startDocumentCreation on onSave', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.documentQuickUploadForm.setValue({
      documentName: 'My Doc',
      typeId: 'type-1',
      channelname: 'email',
      lifeCycleState: 'DRAFT',
    });
    component.attachmentArray = [];

    component.onSave();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DocumentCreateOperationsActions.startDocumentCreation.type,
      })
    );
  });

  it('should set cancelDialogVisible=false and navigate away when form is empty and no attachments', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.documentQuickUploadForm.reset();
    component.attachmentArray = [];

    component.onCancel();

    expect(navigateSpy).toHaveBeenCalledWith(['../'], {
      relativeTo: mockActivatedRoute,
    });
    expect(component.cancelDialogVisible).toBe(false);
  });

  it('should set cancelDialogVisible=true when form has non-lifecycle values', () => {
    component.documentQuickUploadForm.patchValue({ documentName: 'Something' });
    component.attachmentArray = [];

    component.onCancel();

    expect(component.cancelDialogVisible).toBe(true);
  });

  it('should set cancelDialogVisible=true when attachmentArray has items', () => {
    component.documentQuickUploadForm.reset();
    component.attachmentArray = [{ name: 'file.pdf' } as any];

    component.onCancel();

    expect(component.cancelDialogVisible).toBe(true);
  });

  it('should set cancelDialogVisible=false on onCancelNo', () => {
    component.cancelDialogVisible = true;
    component.onCancelNo();
    expect(component.cancelDialogVisible).toBe(false);
  });

  it('should navigate to search on onCancelYes', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onCancelYes();
    expect(navigateSpy).toHaveBeenCalledWith(['../'], {
      relativeTo: mockActivatedRoute,
    });
  });

  it('should remove attachment from array on onDeleteUploadFile', () => {
    const attachment1 = { name: 'file1.pdf', isValid: true } as any;
    const attachment2 = { name: 'file2.pdf', isValid: true } as any;
    component.attachmentArray = [attachment1, attachment2];

    component.onDeleteUploadFile(attachment1);

    expect(component.attachmentArray).toEqual([attachment2]);
  });

  it('should set enableCreateButton=false when remaining attachment is invalid after delete', () => {
    const invalidAttachment = { name: 'invalid.pdf', isValid: false } as any;
    const toDelete = { name: 'file1.pdf', isValid: true } as any;
    component.attachmentArray = [toDelete, invalidAttachment];

    component.onDeleteUploadFile(toDelete);

    expect(component.enableCreateButton).toBe(false);
  });

  it('should set enableCreateButton=false when all attachments are deleted', () => {
    const toDelete = { name: 'file1.pdf', isValid: true } as any;
    component.attachmentArray = [toDelete];

    component.onDeleteUploadFile(toDelete);

    expect(component.enableCreateButton).toBe(false);
  });

  it('should return PrimeIcons.MICROPHONE for audio attachments', () => {
    const attachment = { fileData: { type: 'audio/mp3' } } as any;
    expect(component.getAttachmentIcon(attachment)).toBe(PrimeIcons.MICROPHONE);
  });

  it('should return PrimeIcons.VIDEO for video attachments', () => {
    const attachment = { fileData: { type: 'video/mp4' } } as any;
    expect(component.getAttachmentIcon(attachment)).toBe(PrimeIcons.VIDEO);
  });

  it('should return PrimeIcons.IMAGE for image attachments', () => {
    const attachment = { fileData: { type: 'image/png' } } as any;
    expect(component.getAttachmentIcon(attachment)).toBe(PrimeIcons.IMAGE);
  });

  it('should return PrimeIcons.FILE for unknown attachment types', () => {
    const attachment = { fileData: { type: 'application/pdf' } } as any;
    expect(component.getAttachmentIcon(attachment)).toBe(PrimeIcons.FILE);
  });

  it('should return PrimeIcons.FILE when fileData is absent', () => {
    const attachment = {} as any;
    expect(component.getAttachmentIcon(attachment)).toBe(PrimeIcons.FILE);
  });

  it('should return false for isPaginatorVisible when attachmentArray is empty', () => {
    component.attachmentArray = [];
    expect(component.isPaginatorVisible).toBe(false);
  });

  it('should return true for isPaginatorVisible when attachmentArray has items', () => {
    component.attachmentArray = [{ name: 'file.pdf' } as any];
    expect(component.isPaginatorVisible).toBe(true);
  });

  it('should map non-empty attachmentArray when onSave is called', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.documentQuickUploadForm.setValue({
      documentName: 'My Doc',
      typeId: 'type-1',
      channelname: 'email',
      lifeCycleState: 'DRAFT',
    });
    component.attachmentArray = [
      {
        name: 'file.pdf',
        description: 'desc',
        mimeTypeId: 'mime-1',
        fileName: 'file.pdf',
        fileData: new File(['content'], 'file.pdf'),
        validFor: { endDateTime: '2025-12-31' },
        isValid: true,
      } as any,
    ];

    component.onSave();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DocumentCreateOperationsActions.startDocumentCreation.type,
        docRequest: expect.objectContaining({
          attachments: [
            expect.objectContaining({ name: 'file.pdf', mimeTypeId: 'mime-1' }),
          ],
        }),
      })
    );
  });

  it('should set sortOrder=1 when sorting non-fileData.name field in ASCENDING order', () => {
    component.sortField = 'fileName';
    component.onSortOrderChange(true);
    expect(component.sortOrder).toBe(1);
  });

  it('should set sortOrder=-1 when sorting non-fileData.name field in DESCENDING order', () => {
    component.sortField = 'fileName';
    component.onSortOrderChange(false);
    expect(component.sortOrder).toBe(-1);
  });
});
