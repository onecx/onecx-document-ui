import { createReducer, on } from '@ngrx/store';
import { DocumentCreateOperationsActions } from './document-create-operations.actions';
import { DocumentCreateOperationsState } from './document-create-operations.state';

export const initialState: DocumentCreateOperationsState = {
  availableDocumentTypes: [],
  availableMimeTypes: [],
  pendingAttachmentUploads: 0,
  successfulAttachmentIds: [],
  failedAttachmentIds: [],
};

export const documentCreateOperationsReducer = createReducer(
  initialState,
  on(
    DocumentCreateOperationsActions.availableDocumentTypesReceived,
    (state, { types }): DocumentCreateOperationsState => ({
      ...state,
      availableDocumentTypes: types,
    })
  ),
  on(
    DocumentCreateOperationsActions.availableMimeTypesReceived,
    (state, { mimeTypes }): DocumentCreateOperationsState => ({
      ...state,
      availableMimeTypes: mimeTypes,
    })
  ),
  on(
    DocumentCreateOperationsActions.requestDocumentUploadUrls,
    (state, { files }): DocumentCreateOperationsState => ({
      ...state,
      pendingAttachmentUploads: files.length,
      successfulAttachmentIds: [],
      failedAttachmentIds: [],
    })
  ),
  on(
    DocumentCreateOperationsActions.uploadAttachmentSuccess,
    (state, { attachmentId }): DocumentCreateOperationsState => ({
      ...state,
      successfulAttachmentIds: [...state.successfulAttachmentIds, attachmentId],
      pendingAttachmentUploads: state.pendingAttachmentUploads - 1,
    })
  ),
  on(
    DocumentCreateOperationsActions.attachmentUploadFailed,
    (state, { attachmentId }): DocumentCreateOperationsState => ({
      ...state,
      failedAttachmentIds: [...state.failedAttachmentIds, attachmentId],
      pendingAttachmentUploads: state.pendingAttachmentUploads - 1,
    })
  ),
  on(
    DocumentCreateOperationsActions.documentCreationCompleted,
    DocumentCreateOperationsActions.documentCreationFinalStepFailed,
    DocumentCreateOperationsActions.documentCreationFailed,
    (state): DocumentCreateOperationsState => ({
      ...state,
      pendingAttachmentUploads: 0,
      successfulAttachmentIds: [],
      failedAttachmentIds: [],
    })
  ),
  on(
    DocumentCreateOperationsActions.loadReferenceDataFailed,
    (): DocumentCreateOperationsState => ({ ...initialState })
  )
);
