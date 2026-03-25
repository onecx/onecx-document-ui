import { createReducer, on } from '@ngrx/store';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentQuickUploadState } from './document-quick-upload.state';

export const initialState: DocumentQuickUploadState = {
  optionsLoading: false,
  mimeTypesLoaded: false,
  documentTypesLoaded: false,
  availableDocumentTypes: [],
  availableMimeTypes: [],
  pendingAttachmentUploads: 0,
  successfulAttachmentIds: [],
  failedAttachmentIds: [],
};

export const documentQuickUploadReducer = createReducer(
  initialState,
  on(
    DocumentCreateOperationsActions.ensureReferenceDataLoaded,
    (state): DocumentQuickUploadState => ({
      ...state,
      optionsLoading: !state.mimeTypesLoaded && !state.documentTypesLoaded,
    })
  ),
  on(
    DocumentCreateOperationsActions.availableDocumentTypesReceived,
    (state, { types }): DocumentQuickUploadState => ({
      ...state,
      availableDocumentTypes: types,
      documentTypesLoaded: true,
      optionsLoading: !state.mimeTypesLoaded,
    })
  ),
  on(
    DocumentCreateOperationsActions.availableMimeTypesReceived,
    (state, { mimeTypes }): DocumentQuickUploadState => ({
      ...state,
      availableMimeTypes: mimeTypes,
      mimeTypesLoaded: true,
      optionsLoading: !state.documentTypesLoaded,
    })
  ),
  on(
    DocumentCreateOperationsActions.startDocumentCreation,
    (state): DocumentQuickUploadState => ({
      ...state,
      optionsLoading: true,
    })
  ),
  on(
    DocumentCreateOperationsActions.requestDocumentUploadUrls,
    (state, { files }): DocumentQuickUploadState => ({
      ...state,
      pendingAttachmentUploads: files.length,
      successfulAttachmentIds: [],
      failedAttachmentIds: [],
    })
  ),
  on(
    DocumentCreateOperationsActions.uploadAttachmentSuccess,
    (state, { attachmentId }): DocumentQuickUploadState => ({
      ...state,
      successfulAttachmentIds: [...state.successfulAttachmentIds, attachmentId],
      pendingAttachmentUploads: state.pendingAttachmentUploads - 1,
    })
  ),
  on(
    DocumentCreateOperationsActions.attachmentUploadFailed,
    (state, { attachmentId }): DocumentQuickUploadState => ({
      ...state,
      failedAttachmentIds: [...state.failedAttachmentIds, attachmentId],
      pendingAttachmentUploads: state.pendingAttachmentUploads - 1,
    })
  ),
  on(
    DocumentCreateOperationsActions.documentCreationCompleted,
    DocumentCreateOperationsActions.documentCreationFinalStepFailed,
    DocumentCreateOperationsActions.documentCreationFailed,
    DocumentCreateOperationsActions.loadReferenceDataFailed,
    (state): DocumentQuickUploadState => ({
      ...state,
      optionsLoading: false,
    })
  )
);
