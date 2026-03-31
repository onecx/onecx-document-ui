import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BreadcrumbService } from '@onecx/portal-integration-angular';
import { SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { DocumentCreateStep } from '../../types/document-create-step.enum';
import {
  AttachmentData,
  DocumentCharacteristicFormValue,
  DocumentCreateDetailsStepData,
} from '../../types/document-create.types';
import { DocumentCreateActions } from './document-create.actions';
import { DocumentCreateViewModel } from './document-create.viewmodel';
import {
  selectCreateDocumentTypes,
  selectDocumentCreateViewModel,
} from './document-create.selectors';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.scss'],
})
export class DocumentCreateComponent implements OnInit {
  readonly steps = DocumentCreateStep;
  stepsModel: MenuItem[] = [];
  viewModel$: Observable<DocumentCreateViewModel>;
  documentTypes$: Observable<SelectItem[]>;

  constructor(
    private readonly store: Store,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    this.viewModel$ = this.store.select(selectDocumentCreateViewModel);
    this.documentTypes$ = this.store.select(selectCreateDocumentTypes);
  }

  ngOnInit(): void {
    this.breadcrumbService.setItems([
      {
        labelKey: 'DOCUMENT_SEARCH.HEADER',
        titleKey: 'DOCUMENT_SEARCH.HEADER',
        routerLink: '../',
      },
      {
        labelKey: 'DOCUMENT_CREATE.BREADCRUMB',
        titleKey: 'DOCUMENT_CREATE.BREADCRUMB',
      },
    ]);
    this.stepsModel = [
      {
        label: 'DOCUMENT_CREATE.STEPPER.DETAILS',
      },
      {
        label: 'DOCUMENT_CREATE.STEPPER.ATTACHMENTS',
      },
      {
        label: 'DOCUMENT_CREATE.STEPPER.CHARACTERISTICS',
      },
    ];
  }

  onDetailsNext(
    vm: DocumentCreateViewModel,
    details: Partial<DocumentCreateDetailsStepData>
  ): void {
    this.store.dispatch(
      DocumentCreateActions.detailsStepPatched({
        details,
      })
    );
    this.store.dispatch(
      DocumentCreateActions.goToNextStep({
        currentStep: vm.activeStep,
      })
    );
  }

  onAttachmentsBack(vm: DocumentCreateViewModel): void {
    this.store.dispatch(
      DocumentCreateActions.goToPreviousStep({
        currentStep: vm.activeStep,
      })
    );
  }

  onAttachmentsNext(
    vm: DocumentCreateViewModel,
    attachments: AttachmentData[]
  ): void {
    this.store.dispatch(
      DocumentCreateActions.attachmentsStepPatched({
        attachments,
      })
    );
    this.store.dispatch(
      DocumentCreateActions.goToNextStep({
        currentStep: vm.activeStep,
      })
    );
  }

  onCharacteristicsBack(vm: DocumentCreateViewModel): void {
    this.store.dispatch(
      DocumentCreateActions.goToPreviousStep({
        currentStep: vm.activeStep,
      })
    );
  }

  onCharacteristicsSave(
    characteristics: DocumentCharacteristicFormValue[]
  ): void {
    this.store.dispatch(
      DocumentCreateActions.characteristicsStepPatched({
        characteristics,
      })
    );
    this.store.dispatch(DocumentCreateActions.submitClicked());
  }
}
