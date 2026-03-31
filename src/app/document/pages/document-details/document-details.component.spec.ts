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
  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>
});
