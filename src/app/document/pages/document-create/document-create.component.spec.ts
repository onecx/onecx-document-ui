import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LetDirective } from '@ngrx/component';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  provideAppStateServiceMock,
} from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  PortalCoreModule,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ActivatedRoute } from '@angular/router';
import { DocumentCreateAttachmentsComponent } from './components/document-create-attachments/document-create-attachments.component';
import { DocumentCreateCharacteristicsComponent } from './components/document-create-characteristics/document-create-characteristics.component';
import { DocumentCreateDetailsFormComponent } from './components/document-create-details-form/document-create-details-form.component';
import { DocumentCreateActions } from './document-create.actions';
import { DocumentCreateComponent } from './document-create.component';
import { initialState } from './document-create.reducers';
import {
  selectCanGoNextFromAttachments,
  selectCreateDocumentTypes,
  selectCreateMimeTypes,
  selectDocumentCreateViewModel,
} from './document-create.selectors';
import { DocumentCreateViewModel } from './document-create.viewmodel';
import { DocumentCreateStep } from '../../types/document-create-step.enum';

describe('DocumentCreateComponent', () => {
  let component: DocumentCreateComponent;
  let fixture: ComponentFixture<DocumentCreateComponent>;
  let store: MockStore<Store>;

  const mockViewModel: DocumentCreateViewModel = {
    activeStep: DocumentCreateStep.Details,
    details: null,
    attachments: [],
    characteristics: [],
    submitting: false,
    referenceDataLoading: false,
    referenceDataLoaded: false,
    error: null,
  };

   
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DocumentCreateComponent,
        DocumentCreateDetailsFormComponent,
        DocumentCreateAttachmentsComponent,
        DocumentCreateCharacteristicsComponent,
      ],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
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
        provideMockStore({ initialState: { document: { create: initialState } } }),
        provideAppStateServiceMock(),
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    store = TestBed.inject<MockStore<Store>>(MockStore);
    store.overrideSelector(selectDocumentCreateViewModel, mockViewModel);
    store.overrideSelector(selectCreateDocumentTypes, []);
    store.overrideSelector(selectCreateMimeTypes, []);
    store.overrideSelector(selectCanGoNextFromAttachments, false);
    store.refreshState();

    fixture = TestBed.createComponent(DocumentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should set breadcrumb with two items including search routerLink', () => {
      const breadcrumbService = TestBed.inject(BreadcrumbService);
      const setItemsSpy = jest.spyOn(breadcrumbService, 'setItems');

      component.ngOnInit();

      expect(setItemsSpy).toHaveBeenCalledWith([
        expect.objectContaining({ routerLink: '../' }),
        expect.objectContaining({ labelKey: 'DOCUMENT_CREATE.BREADCRUMB' }),
      ]);
    });

    it('should build stepsModel with 3 translated labels', () => {
      const translateService = TestBed.inject(TranslateService);
      translateService.use('en');

      component.ngOnInit();

      expect(component.stepsModel).toHaveLength(3);
      expect(component.stepsModel[0].label).toBeDefined();
      expect(component.stepsModel[1].label).toBeDefined();
      expect(component.stepsModel[2].label).toBeDefined();
    });
  });

  describe('onDetailsNext', () => {
    it('should dispatch detailsStepPatched and goToNextStep', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const details = { name: 'My Doc', type: 'type-1', channel: 'ch-1' };
      const vm = { ...mockViewModel, activeStep: DocumentCreateStep.Details };

      component.onDetailsNext(vm, details as any);

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.detailsStepPatched({ details: details as any })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.goToNextStep({
          currentStep: DocumentCreateStep.Details,
        })
      );
    });
  });

  describe('onAttachmentsBack', () => {
    it('should dispatch attachmentsStepPatched and goToPreviousStep', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const attachments = [{ fileName: 'file.pdf' }] as any;
      const vm = {
        ...mockViewModel,
        activeStep: DocumentCreateStep.Attachments,
      };

      component.onAttachmentsBack(vm, attachments);

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.attachmentsStepPatched({ attachments })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.goToPreviousStep({
          currentStep: DocumentCreateStep.Attachments,
        })
      );
    });
  });

  describe('onAttachmentsNext', () => {
    it('should dispatch attachmentsStepPatched and goToNextStep', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const attachments = [{ fileName: 'file.pdf' }] as any;
      const vm = {
        ...mockViewModel,
        activeStep: DocumentCreateStep.Attachments,
      };

      component.onAttachmentsNext(vm, attachments);

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.attachmentsStepPatched({ attachments })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.goToNextStep({
          currentStep: DocumentCreateStep.Attachments,
        })
      );
    });
  });

  describe('onAttachmentMimeTypeNotSupported', () => {
    it('should dispatch attachmentMimeTypeNotSupported with fileName', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.onAttachmentMimeTypeNotSupported('bad-file.exe');

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.attachmentMimeTypeNotSupported({
          fileName: 'bad-file.exe',
        })
      );
    });
  });

  describe('onCharacteristicsBack', () => {
    it('should dispatch goToPreviousStep with current step', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const vm = {
        ...mockViewModel,
        activeStep: DocumentCreateStep.Characteristics,
      };

      component.onCharacteristicsBack(vm);

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.goToPreviousStep({
          currentStep: DocumentCreateStep.Characteristics,
        })
      );
    });
  });

  describe('onCharacteristicsSave', () => {
    it('should dispatch characteristicsStepPatched and submitClicked', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const characteristics = [{ name: 'color', value: 'red' }] as any;

      component.onCharacteristicsSave(characteristics);

      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.characteristicsStepPatched({ characteristics })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        DocumentCreateActions.submitClicked()
      );
    });
  });
});
