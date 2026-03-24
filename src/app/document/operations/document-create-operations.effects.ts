import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  DocumentControllerV1,
  DocumentDetail,
  UploadAttachmentPresignedUrlRequest,
} from 'src/app/shared/generated';
import { DocumentCreateOperationsActions } from './document-create-operations.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { FileUploaderService } from '../service/file-uploader.service';

@Injectable({ providedIn: 'root' })
export class DocumentCreateOperationsEffects {
  constructor(
    private actions$: Actions,
    private documentService: DocumentControllerV1,
    private uploaderService: FileUploaderService
  ) {}

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
        return DocumentCreateOperationsActions.requestDocumentUploadUrls({
          createdDocument,
          uploadRequests,
          files,
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
      switchMap((action) =>
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

  attachmentSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentCreateOperationsActions.uploadAttachmentSuccess),
        switchMap((action) =>
          this.documentService.updateAttachmentsMetadata(action.attachmentId)
        )
      );
    },
    { dispatch: false }
  );

  attachmentFailed$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentCreateOperationsActions.attachmentUploadFailed),
        switchMap((action) =>
          this.documentService.createFailedAttachmentsAuditLogs(
            action.attachmentId
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
}
