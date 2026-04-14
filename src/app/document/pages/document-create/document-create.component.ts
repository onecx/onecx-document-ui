import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbService } from '@onecx/portal-integration-angular';
import { SelectItem, MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { DocumentCreateStep } from '../../types/document-create-step.enum';
import {
  AttachmentDraft,
  DocumentCharacteristicFormValue,
  DocumentCreateDetailsStepData,
} from '../../types/document-create.types';
import { DocumentCreateActions } from './document-create.actions';
import { DocumentCreateViewModel } from './document-create.viewmodel';
import {
  selectCanGoNextFromAttachments,
  selectCreateDocumentTypes,
  selectCreateMimeTypes,
  selectDocumentCreateViewModel,
} from './document-create.selectors';

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
  mimeTypes$: Observable<SelectItem[]>;
  canGoNextFromAttachments$: Observable<boolean>;

  constructor(
    private readonly store: Store,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly translateService: TranslateService
  ) {
    this.viewModel$ = this.store.select(selectDocumentCreateViewModel);
    this.documentTypes$ = this.store.select(selectCreateDocumentTypes);
    this.mimeTypes$ = this.store.select(selectCreateMimeTypes);
    this.canGoNextFromAttachments$ = this.store.select(
      selectCanGoNextFromAttachments
    );
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
        label: this.translateService.instant('DOCUMENT_CREATE.STEPPER.DETAILS'),
      },
      {
        label: this.translateService.instant(
          'DOCUMENT_CREATE.STEPPER.ATTACHMENTS'
        ),
      },
      {
        label: this.translateService.instant(
          'DOCUMENT_CREATE.STEPPER.CHARACTERISTICS'
        ),
      },
    ];
  }

  onDetailsNext(
    vm: DocumentCreateViewModel,
    details: Partial<DocumentCreateDetailsStepData>
  ): void {
    this.store.dispatch(DocumentCreateActions.detailsStepPatched({ details }));
    this.store.dispatch(
      DocumentCreateActions.goToNextStep({ currentStep: vm.activeStep })
    );
  }

  onAttachmentsBack(
    vm: DocumentCreateViewModel,
    attachments: AttachmentDraft[]
  ): void {
    this.store.dispatch(
      DocumentCreateActions.attachmentsStepPatched({ attachments })
    );
    this.store.dispatch(
      DocumentCreateActions.goToPreviousStep({ currentStep: vm.activeStep })
    );
  }

  onAttachmentsNext(
    vm: DocumentCreateViewModel,
    attachments: AttachmentDraft[]
  ): void {
    this.store.dispatch(
      DocumentCreateActions.attachmentsStepPatched({ attachments })
    );
    this.store.dispatch(
      DocumentCreateActions.goToNextStep({ currentStep: vm.activeStep })
    );
  }

  onAttachmentMimeTypeNotSupported(fileName: string): void {
    this.store.dispatch(
      DocumentCreateActions.attachmentMimeTypeNotSupported({ fileName })
    );
  }

  onCharacteristicsBack(vm: DocumentCreateViewModel): void {
    this.store.dispatch(
      DocumentCreateActions.goToPreviousStep({ currentStep: vm.activeStep })
    );
  }

  onCharacteristicsSave(
    characteristics: DocumentCharacteristicFormValue[]
  ): void {
    this.store.dispatch(
      DocumentCreateActions.characteristicsStepPatched({ characteristics })
    );
    this.store.dispatch(DocumentCreateActions.submitClicked());
  }
}
