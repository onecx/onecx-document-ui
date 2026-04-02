import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import {
  Attachment,
  DocumentControllerV1,
  DocumentDetail,
  DocumentTypeControllerV1,
  SupportedMimeTypeControllerV1,
  UpdateFileMetadataRequest,
  UploadAttachmentPresignedUrlRequest,
} from 'src/app/shared/generated';
import { DocumentCreateOperationsActions } from './document-create-operations.actions';
import {
  catchError,
  filter,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import { ExternalFileHandlerService } from '../service/external-file-handler.service';
import { documentCreateOperationsSelectors } from './document-create-operations.selectors';
import { AttachmentFile } from '../types/document-create.types';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStateService } from '@onecx/angular-integration-interface';

@Injectable({ providedIn: 'root' })
export class DocumentCreateOperationsEffects {
  constructor(
    private actions$: Actions,
    private readonly store: Store,
    private documentService: DocumentControllerV1,
    private readonly documentTypeService: DocumentTypeControllerV1,
    private readonly supportedMimeTypeService: SupportedMimeTypeControllerV1,
    private uploaderService: ExternalFileHandlerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appStateService: AppStateService
  ) {}

  private readonly referenceDataPaths = ['quick-upload', 'create-document'];

  loadReferenceDataOnRouteEnter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      map((action) => action.payload.routerState.url),
      map((url) =>
        this.referenceDataPaths.some((path) =>
          url.toLowerCase().includes(`/${path}`)
        )
      ),
      filter((shouldLoad) => shouldLoad),
      map(() => DocumentCreateOperationsActions.ensureReferenceDataLoaded())
    );
  });

  ensureReferenceDataLoaded$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.ensureReferenceDataLoaded),
      concatLatestFrom(() => [
        this.store.select(
          documentCreateOperationsSelectors.selectAvailableDocumentTypes
        ),
        this.store.select(
          documentCreateOperationsSelectors.selectAvailableMimeTypes
        ),
      ]),
      switchMap(([, availableDocumentTypes, availableMimeTypes]) => {
        const documentTypes$ = availableDocumentTypes.length
          ? of(availableDocumentTypes)
          : this.documentTypeService.getAllTypesOfDocument();
        const mimeTypes$ = availableMimeTypes.length
          ? of(availableMimeTypes)
          : this.supportedMimeTypeService.getAllSupportedMimeTypes();

        return documentTypes$.pipe(
          switchMap((types) =>
            mimeTypes$.pipe(
              mergeMap((mimeTypes) => [
                DocumentCreateOperationsActions.availableDocumentTypesReceived({
                  types,
                }),
                DocumentCreateOperationsActions.availableMimeTypesReceived({
                  mimeTypes,
                }),
              ])
            )
          ),
          catchError((error) =>
            of(
              DocumentCreateOperationsActions.loadReferenceDataFailed({
                error: error?.message ?? null,
              })
            )
          )
        );
      })
    );
  });

  startDocumentCreation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.startDocumentCreation),
      switchMap((action) =>
        this.documentService.createDocument(action.docRequest).pipe(
          map((response) =>
            DocumentCreateOperationsActions.documentCreatedSuccesfully({
              createdDocument: response,
              files: action.files,
            })
          ),
          catchError(() =>
            of(DocumentCreateOperationsActions.documentCreationFailed())
          )
        )
      )
    );
  });

  documentCreatedSuccesfully$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.documentCreatedSuccesfully),
      map((action) => {
        const { createdDocument, files } = action;
        const uploadRequests = this.buildPresignedUrlRequests(createdDocument);
        const filesToUplad = this.assignAttachmentId(
          createdDocument.attachments || [],
          files
        );
        return DocumentCreateOperationsActions.requestDocumentUploadUrls({
          createdDocument,
          uploadRequests,
          files: filesToUplad,
        });
      })
    );
  });

  requestDocumentUploadUrls$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.requestDocumentUploadUrls),
      switchMap((action) =>
        this.documentService
          .uploadAllFiles(action.createdDocument.id!, action.uploadRequests)
          .pipe(
            mergeMap((response) =>
              response.map((presignedUrlResponse) => {
                const { attachmentId, url } = presignedUrlResponse;
                const { id } = action.createdDocument;
                const { file } = action.files.find(
                  (attFile) => attFile.attachmentId === attachmentId
                )!;
                return DocumentCreateOperationsActions.uploadAttachment({
                  presignedUrl: url!,
                  file,
                  attachmentId: attachmentId!,
                  documentId: id!,
                });
              })
            )
          )
      )
    );
  });

  uploadAttachment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.uploadAttachment),
      mergeMap((action) =>
        this.uploaderService
          .uploadAttachment(action.presignedUrl, action.file)
          .pipe(
            map(() =>
              DocumentCreateOperationsActions.uploadAttachmentSuccess({
                documentId: action.documentId,
                attachmentId: action.attachmentId,
              })
            ),
            catchError(() =>
              of(
                DocumentCreateOperationsActions.attachmentUploadFailed({
                  documentId: action.documentId,
                  attachmentId: action.attachmentId,
                })
              )
            )
          )
      )
    );
  });

  trackUploadCompletion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        DocumentCreateOperationsActions.uploadAttachmentSuccess,
        DocumentCreateOperationsActions.attachmentUploadFailed
      ),
      concatLatestFrom(() => [
        this.store.select(
          documentCreateOperationsSelectors.selectPendingAttachmentUploads
        ),
        this.store.select(
          documentCreateOperationsSelectors.selectSuccessfulAttachmentIds
        ),
        this.store.select(
          documentCreateOperationsSelectors.selectFailedAttachmentIds
        ),
      ]),
      filter(([, pending]) => (pending as number) === 0),
      map(([action, , successfulIds, failedIds]) => {
        const documentId = (action as { documentId: string }).documentId;
        return DocumentCreateOperationsActions.allAttachmentsUploaded({
          documentId,
          successfulIds: successfulIds as string[],
          failedIds: failedIds as string[],
        });
      })
    );
  });

  allAttachmentsUploaded$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.allAttachmentsUploaded),
      switchMap((action) => {
        const metadata$ = action.successfulIds.length
          ? this.documentService.updateAttachmentsMetadata(
              action.documentId,
              action.successfulIds.map(
                (attachmentId) =>
                  ({ attachmentId } as UpdateFileMetadataRequest)
              )
            )
          : of(null);
        const auditLog$ = action.failedIds.length
          ? this.documentService.createFailedAttachmentsAuditLogs(
              action.documentId,
              action.failedIds.map(
                (attachmentId) =>
                  ({ attachmentId } as UpdateFileMetadataRequest)
              )
            )
          : of(null);
        return forkJoin([metadata$, auditLog$]).pipe(
          map(() =>
            DocumentCreateOperationsActions.documentCreationCompleted({
              documentId: action.documentId,
            })
          ),
          catchError(() =>
            of(
              DocumentCreateOperationsActions.documentCreationFinalStepFailed({
                documentId: action.documentId,
              })
            )
          )
        );
      })
    );
  });

  navigateToDetails$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          DocumentCreateOperationsActions.documentCreationCompleted,
          DocumentCreateOperationsActions.documentCreationFinalStepFailed
        ),
        switchMap((action) =>
          this.appStateService.currentMfe$.asObservable().pipe(
            map((mfe) => {
              this.router.navigate([
                `/${mfe.baseHref}`,
                'document-management',
                'details',
                action.documentId,
              ]);
            })
          )
        )
      );
    },
    { dispatch: false }
  );

  private buildPresignedUrlRequests(
    document: DocumentDetail
  ): UploadAttachmentPresignedUrlRequest[] {
    return document.attachments!.map((attachment) => ({
      fileName: attachment.fileName,
      attachmentId: attachment.id,
    }));
  }

  private assignAttachmentId(
    attachments: Attachment[],
    attachmentFiles: AttachmentFile[]
  ): AttachmentFile[] {
    const fileNames: Record<string, string> = attachments.reduce(
      (prev, curr) => {
        prev[curr.fileName!] = curr.id!;
        return prev;
      },
      {} as Record<string, string>
    );
    return attachmentFiles.map((attFIle) => ({
      ...attFIle,
      attachmentId: fileNames[attFIle.fileName!],
    }));
  }
}
