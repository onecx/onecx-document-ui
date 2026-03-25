import { createReducer, on } from '@ngrx/store';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentQuickUploadState } from './document-quick-upload.state';

export const initialState: DocumentQuickUploadState = {
  optionsLoading: false,
  mimeTypesLoaded: false,
  documentTypesLoaded: false,
  availableDocumentTypes: [],
  availableMimeTypes: [],
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
    DocumentCreateOperationsActions.loadReferenceDataFailed,
    (state): DocumentQuickUploadState => ({
      ...state,
      optionsLoading: false,
    })
  )
);
