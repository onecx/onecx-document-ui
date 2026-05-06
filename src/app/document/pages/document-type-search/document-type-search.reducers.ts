import { createReducer, on } from '@ngrx/store';
import { DocumentTypeSearchActions } from './document-type-search.actions';
import { documentTypeSearchColumns } from './document-type-search.columns';
import { DocumentTypeSearchState } from './document-type-search.state';

export const initialState: DocumentTypeSearchState = {
  columns: documentTypeSearchColumns,
  results: [],
  loadingIndicator: false,
  resultComponentState: null,
  searchHeaderComponentState: null,
  dialogVisible: false,
  editingDocumentType: null,
};

export const documentTypeSearchReducer = createReducer(
  initialState,
  on(
    DocumentTypeSearchActions.loadDocumentTypesTriggered,
    (state): DocumentTypeSearchState => ({
      ...state,
      loadingIndicator: true,
    })
  ),
  on(
    DocumentTypeSearchActions.documentTypesReceived,
    (state, { documentTypes }): DocumentTypeSearchState => ({
      ...state,
      results: documentTypes,
      loadingIndicator: false,
    })
  ),
  on(
    DocumentTypeSearchActions.documentTypesLoadingFailed,
    (state): DocumentTypeSearchState => ({
      ...state,
      results: [],
      loadingIndicator: false,
    })
  ),
  on(
    DocumentTypeSearchActions.createDialogOpened,
    (state): DocumentTypeSearchState => ({
      ...state,
      dialogVisible: true,
      editingDocumentType: null,
    })
  ),
  on(
    DocumentTypeSearchActions.editDocumentTypeButtonClicked,
    (state, { documentType }): DocumentTypeSearchState => ({
      ...state,
      dialogVisible: true,
      editingDocumentType: documentType,
    })
  ),
  on(
    DocumentTypeSearchActions.dialogClosed,
    (state): DocumentTypeSearchState => ({
      ...state,
      dialogVisible: false,
      editingDocumentType: null,
    })
  ),
  on(
    DocumentTypeSearchActions.documentTypeCreated,
    (state, { documentType }): DocumentTypeSearchState => ({
      ...state,
      results: [...state.results, documentType],
      dialogVisible: false,
      editingDocumentType: null,
    })
  ),
  on(
    DocumentTypeSearchActions.documentTypeUpdated,
    (state, { documentType }): DocumentTypeSearchState => ({
      ...state,
      results: state.results.map((r) =>
        r.id === documentType.id ? documentType : r
      ),
      dialogVisible: false,
      editingDocumentType: null,
    })
  ),
  on(
    DocumentTypeSearchActions.documentTypeDeleted,
    (state, { id }): DocumentTypeSearchState => ({
      ...state,
      results: state.results.filter((r) => r.id !== id),
    })
  ),
  on(
    DocumentTypeSearchActions.resultComponentStateChanged,
    (state, resultComponentState): DocumentTypeSearchState => ({
      ...state,
      resultComponentState,
    })
  ),
  on(
    DocumentTypeSearchActions.searchHeaderComponentStateChanged,
    (state, searchHeaderComponentState): DocumentTypeSearchState => ({
      ...state,
      searchHeaderComponentState,
    })
  )
);
