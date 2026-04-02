import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  provideAppStateServiceMock,
  provideUserServiceMock,
} from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  HAS_PERMISSION_CHECKER,
  PortalCoreModule,
  UserService,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocumentDetailsActions } from './document-details.actions';
import { DocumentDetailsComponent } from './document-details.component';
import { initialState } from './document-details.reducers';
import { selectDocumentDetailsViewModel } from './document-details.selectors';
import { DocumentDetailsViewModel } from './document-details.viewmodel';

describe('DocumentDetailsComponent', () => {
  let component: DocumentDetailsComponent;
  let fixture: ComponentFixture<DocumentDetailsComponent>;
  let store: MockStore<Store>;
  let breadcrumbService: BreadcrumbService;

  const mockActivatedRoute = { snapshot: { data: {} } };

  const baseDocumentDetailsViewModel: DocumentDetailsViewModel = {
    details: undefined,
    detailsLoadingIndicator: false,
    detailsLoaded: true,
    backNavigationPossible: true,
    editMode: false,
    isSubmitting: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentDetailsComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('./../../../../assets/i18n/en.json')
        ).withTranslations('de', require('./../../../../assets/i18n/de.json')),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { document: { details: initialState } },
        }),
        BreadcrumbService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideUserServiceMock(),
        provideAppStateServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useExisting: UserService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(
      selectDocumentDetailsViewModel,
      baseDocumentDetailsViewModel
    );
    store.refreshState();

    fixture = TestBed.createComponent(DocumentDetailsComponent);
    component = fixture.componentInstance;
    breadcrumbService = TestBed.inject(BreadcrumbService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set breadcrumbs on init', () => {
    jest.spyOn(breadcrumbService, 'setItems');
    component.ngOnInit();
    expect(breadcrumbService.setItems).toHaveBeenCalledWith([
      expect.objectContaining({ labelKey: 'DOCUMENT_SEARCH.HEADER' }),
      expect.objectContaining({ labelKey: 'DOCUMENT_DETAILS.BREADCRUMB' }),
    ]);
  });

  it('should dispatch editButtonClicked when edit() is called', () => {
    jest.spyOn(store, 'dispatch');
    component.edit();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.editButtonClicked()
    );
  });

  it('should dispatch saveButtonClicked with form raw value when save() is called', () => {
    jest.spyOn(store, 'dispatch');
    component.save();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.saveButtonClicked({
        details: component.formGroup.getRawValue(),
      })
    );
  });

  it('should dispatch cancelButtonClicked with dirty=false when form is pristine', () => {
    jest.spyOn(store, 'dispatch');
    component.cancel();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.cancelButtonClicked({ dirty: false })
    );
  });

  it('should dispatch deleteButtonClicked when delete() is called', () => {
    jest.spyOn(store, 'dispatch');
    component.delete();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.deleteButtonClicked()
    );
  });

  it('should dispatch navigateBackButtonClicked when back action callback is invoked', (done) => {
    component.headerActions$.subscribe((actions) => {
      const backAction = actions.find((a) => a.labelKey?.includes('BACK'));
      jest.spyOn(store, 'dispatch');
      backAction?.actionCallback();
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentDetailsActions.navigateBackButtonClicked()
      );
      done();
    });
  });

  it('should disable form when editMode is false', () => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: false,
    });
    store.refreshState();
    expect(component.formGroup.disabled).toBe(true);
  });

  it('should enable form when editMode is true', () => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: true,
    });
    store.refreshState();
    expect(component.formGroup.enabled).toBe(true);
  });

  it('should dispatch startAttachmentDownload when onAttachmentDownload is called', () => {
    jest.spyOn(store, 'dispatch');
    component.onAttachmentDownload({
      id: 'att-1',
      fileName: 'file.pdf',
    } as any);
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.startAttachmentDownload({
        attachmentId: 'att-1',
        fileName: 'file.pdf',
      })
    );
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn((component as any).sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch cancelButtonClicked with dirty=true when form is dirty', () => {
    jest.spyOn(store, 'dispatch');
    component.formGroup.markAsDirty();
    component.cancel();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentDetailsActions.cancelButtonClicked({ dirty: true })
    );
  });

  it('should remove characteristic at given index when onCharacteristicRemove is called', () => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: true,
    });
    store.refreshState();
    const arr = component.characteristicsFormArray;
    const initialLength = arr.length;
    component.onCharacteristicAdd();
    component.onCharacteristicAdd();
    expect(arr.length).toBe(initialLength + 2);
    component.onCharacteristicRemove(0);
    expect(arr.length).toBe(initialLength + 1);
  });

  it('should add a characteristic row when onCharacteristicAdd is called', () => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: true,
    });
    store.refreshState();
    const arr = component.characteristicsFormArray;
    const before = arr.length;
    component.onCharacteristicAdd();
    expect(arr.length).toBe(before + 1);
  });

  it('should expose attachmentsFormArray from the form group', () => {
    expect(component.attachmentsFormArray).toBeDefined();
  });

  it('should build 5 header actions covering back, edit, cancel, save and delete', (done) => {
    component.headerActions$.subscribe((actions) => {
      expect(actions.length).toBe(5);
      const labelKeys = actions.map((a) => a.labelKey);
      expect(labelKeys).toContain('DOCUMENT_DETAILS.GENERAL.BACK');
      expect(labelKeys).toContain('DOCUMENT_DETAILS.GENERAL.EDIT');
      expect(labelKeys).toContain('DOCUMENT_DETAILS.GENERAL.CANCEL');
      expect(labelKeys).toContain('DOCUMENT_DETAILS.GENERAL.SAVE');
      expect(labelKeys).toContain('DOCUMENT_DETAILS.GENERAL.DELETE');
      done();
    });
  });

  it('should show back and edit actions and hide cancel and save when not in editMode', (done) => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: false,
    });
    store.refreshState();
    component.headerActions$.subscribe((actions) => {
      const back = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.BACK'
      );
      const edit = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.EDIT'
      );
      const cancel = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.CANCEL'
      );
      const save = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.SAVE'
      );
      expect(back?.showCondition).toBe(true);
      expect(edit?.showCondition).toBe(true);
      expect(cancel?.showCondition).toBe(false);
      expect(save?.showCondition).toBe(false);
      done();
    });
  });

  it('should show cancel and save actions and hide back and edit when in editMode', (done) => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: true,
    });
    store.refreshState();
    component.headerActions$.subscribe((actions) => {
      const back = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.BACK'
      );
      const edit = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.EDIT'
      );
      const cancel = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.CANCEL'
      );
      const save = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.SAVE'
      );
      expect(back?.showCondition).toBe(false);
      expect(edit?.showCondition).toBe(false);
      expect(cancel?.showCondition).toBe(true);
      expect(save?.showCondition).toBe(true);
      done();
    });
  });

  it('should disable cancel and save when isSubmitting=true', (done) => {
    store.overrideSelector(selectDocumentDetailsViewModel, {
      ...baseDocumentDetailsViewModel,
      editMode: true,
      isSubmitting: true,
    });
    store.refreshState();
    component.headerActions$.subscribe((actions) => {
      const cancel = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.CANCEL'
      );
      const save = actions.find(
        (a) => a.labelKey === 'DOCUMENT_DETAILS.GENERAL.SAVE'
      );
      expect(cancel?.disabled).toBe(true);
      expect(save?.disabled).toBe(true);
      done();
    });
  });
  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>

  describe('headerActions$ callbacks', () => {
    it('should call edit() when edit action callback is invoked', (done) => {
      jest.spyOn(store, 'dispatch');
      component.headerActions$.subscribe((actions) => {
        const editAction = actions.find((a) => a.labelKey?.includes('EDIT'));
        editAction?.actionCallback!();
        expect(store.dispatch).toHaveBeenCalledWith(
          DocumentDetailsActions.editButtonClicked()
        );
        done();
      });
    });

    it('should call cancel() when cancel action callback is invoked', (done) => {
      jest.spyOn(store, 'dispatch');
      component.headerActions$.subscribe((actions) => {
        const cancelAction = actions.find((a) =>
          a.labelKey?.includes('CANCEL')
        );
        cancelAction?.actionCallback!();
        expect(store.dispatch).toHaveBeenCalledWith(
          DocumentDetailsActions.cancelButtonClicked({ dirty: false })
        );
        done();
      });
    });

    it('should call save() when save action callback is invoked', (done) => {
      jest.spyOn(store, 'dispatch');
      component.headerActions$.subscribe((actions) => {
        const saveAction = actions.find((a) => a.labelKey?.includes('SAVE'));
        saveAction?.actionCallback!();
        expect(store.dispatch).toHaveBeenCalledWith(
          DocumentDetailsActions.saveButtonClicked({
            details: component.formGroup.getRawValue() as any,
          })
        );
        done();
      });
    });

    it('should call delete() when delete action callback is invoked', (done) => {
      jest.spyOn(store, 'dispatch');
      component.headerActions$.subscribe((actions) => {
        const deleteAction = actions.find((a) =>
          a.labelKey?.includes('DELETE')
        );
        deleteAction?.actionCallback!();
        expect(store.dispatch).toHaveBeenCalledWith(
          DocumentDetailsActions.deleteButtonClicked()
        );
        done();
      });
    });
  });
});
