import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import { filterForNavigatedTo } from '@onecx/ngrx-accelerator';
import { PortalMessageService } from '@onecx/portal-integration-angular';
import {
  AttachmentCreateUpdate,
  DocumentCharacteristicCreateUpdate,
  DocumentCreateUpdate,
  LifeCycleState,
} from 'src/app/shared/generated';
import { filter, map, mergeMap, tap } from 'rxjs';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import {
  AttachmentDraft,
  AttachmentFile,
  DocumentCharacteristicFormValue,
  DocumentCreateSubmissionSource,
} from '../../types/document-create.types';
import { DocumentCreateComponent } from './document-create.component';
import { DocumentCreateActions } from './document-create.actions';
import { selectDocumentCreateSubmissionSource } from './document-create.selectors';

@Injectable()
export class DocumentCreateEffects {
  constructor(
    private actions$: Actions,
    private readonly store: Store,
    private readonly router: Router,
    private readonly messageService: PortalMessageService
  ) {}

  navigatedToCreatePage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, DocumentCreateComponent),
      map(() => DocumentCreateActions.enteredPage())
    );
  });

  attachmentMimeTypeNotSupported$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentCreateActions.attachmentMimeTypeNotSupported),
        tap(() => {
          this.messageService.error({
            summaryKey:
              'DOCUMENT_CREATE.ATTACHMENTS.ERROR_MESSAGES.MIME_TYPE_NOT_SUPPORTED',
          });
        })
      );
    },
    { dispatch: false }
  );

  submitDocumentCreation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateActions.submitClicked),
      concatLatestFrom(() =>
        this.store.select(selectDocumentCreateSubmissionSource)
      ),
      map(([, source]) => this.mapSubmitPayload(source)),
      mergeMap((payload) =>
        payload
          ? [
              DocumentCreateOperationsActions.startDocumentCreation({
                docRequest: payload.docRequest,
                files: payload.files,
              }),
            ]
          : [
              DocumentCreateActions.stepValidationFailed({
                error: 'DOCUMENT_CREATE.ERROR_MESSAGES.SUBMIT_VALIDATION',
              }),
              DocumentCreateActions.submitFinished(),
            ]
      )
    );
  });

  onDocumentCreationCompleted$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentCreateOperationsActions.documentCreationCompleted),
        tap(() => {
          this.messageService.success({
            summaryKey: 'DOCUMENT_CREATE.SUCCESS_MESSAGES.CREATE_SUCCESS',
          });
        })
      );
    },
    { dispatch: false }
  );

  onDocumentCreationFailed$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          DocumentCreateOperationsActions.documentCreationFailed,
          DocumentCreateOperationsActions.documentCreationFinalStepFailed
        ),
        tap(() => {
          this.messageService.error({
            summaryKey: 'DOCUMENT_CREATE.ERROR_MESSAGES.CREATE_ERROR',
          });
        })
      );
    },
    { dispatch: false }
  );

  onDocumentCreationFinished$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        DocumentCreateOperationsActions.documentCreationCompleted,
        DocumentCreateOperationsActions.documentCreationFailed,
        DocumentCreateOperationsActions.documentCreationFinalStepFailed
      ),
      map(() => DocumentCreateActions.submitFinished())
    );
  });

  resetStateOnSubmitSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.documentCreationCompleted),
      map(() => DocumentCreateActions.resetClicked())
    );
  });

  resetStateWhenLeavingCreatePage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      map((action) => action.payload.routerState.url),
      filter((url) => !url.toLowerCase().includes('/create-document')),
      map(() => DocumentCreateActions.resetClicked())
    );
  });

  private mapSubmitPayload(
    source: DocumentCreateSubmissionSource
  ): { docRequest: DocumentCreateUpdate; files: AttachmentFile[] } | null {
    if (
      !source.details ||
      !source.details.name ||
      !source.details.type ||
      !source.details.channel
    ) {
      return null;
    }

    const docRequest: DocumentCreateUpdate = {
      name: source.details.name,
      typeId: source.details.type,
      channel: {
        name: source.details.channel!,
      },
      lifeCycleState: source.details.status as LifeCycleState,
      documentVersion: source.details.version ?? undefined,
      specification: undefined,
      description: source.details.description || undefined,
      relatedObject: {
        involvement: source.details.involvement ?? undefined,
        objectReferenceType: source.details.objectReferenceType ?? undefined,
        objectReferenceId: source.details.objectReferenceId ?? undefined,
      },
      tags: [],
      documentRelationships: [],
      relatedParties: [],
      categories: [],
      characteristics: this.mapCharacteristics(source.characteristics),
      attachments: this.mapAttachments(source.attachments),
    };

    const files = source.attachments.map((attachment) => ({
      file: attachment.file,
      fileName: attachment.fileName,
    }));

    return { docRequest, files };
  }

  private mapAttachments(
    attachments: AttachmentDraft[]
  ): AttachmentCreateUpdate[] {
    return attachments.map((attachment) => ({
      name: attachment.name ?? undefined,
      description: attachment.description ?? undefined,
      mimeTypeId: attachment.mimeTypeId ?? undefined,
      fileName: attachment.fileName,
      validFor: { endDateTime: attachment.validForEnd || undefined },
    }));
  }

  private mapCharacteristics(
    characteristics: DocumentCharacteristicFormValue[]
  ): DocumentCharacteristicCreateUpdate[] {
    return characteristics
      .filter((characteristic) => characteristic.name && characteristic.value)
      .map((characteristic) => ({
        id: characteristic.id ?? undefined,
        name: characteristic.name!, // filter guarantees non-null
        value: characteristic.value!, // filter guarantees non-null
      }));
  }
}
