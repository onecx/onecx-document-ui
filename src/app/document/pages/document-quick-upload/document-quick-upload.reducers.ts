import { createReducer, on } from '@ngrx/store';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentQuickUploadState } from './document-quick-upload.state';

export const initialState: DocumentQuickUploadState = {
  optionsLoading: false,
  mimeTypesLoaded: false,
  documentTypesLoaded: false,
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
    (state): DocumentQuickUploadState => ({
      ...state,
      documentTypesLoaded: true,
      optionsLoading: !state.mimeTypesLoaded,
    })
  ),
  on(
    DocumentCreateOperationsActions.availableMimeTypesReceived,
    (state): DocumentQuickUploadState => ({
      ...state,
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
    DocumentCreateOperationsActions.documentCreationCompleted,
    DocumentCreateOperationsActions.documentCreationFinalStepFailed,
    DocumentCreateOperationsActions.documentCreationFailed,
    DocumentCreateOperationsActions.loadReferenceDataFailed,
    (): DocumentQuickUploadState => ({
      ...initialState,
    })
  )
);
