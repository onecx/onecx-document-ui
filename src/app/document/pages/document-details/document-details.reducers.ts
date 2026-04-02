import { createReducer, on } from '@ngrx/store';
import { DocumentDetailsActions } from './document-details.actions';
import { DocumentDetailsState } from './document-details.state';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';

export const initialState: DocumentDetailsState = {
  details: undefined,
  detailsLoadingIndicator: true,
  detailsLoaded: false,
  editMode: false,
  isSubmitting: false,
};

export const documentDetailsReducer = createReducer(
  initialState,
  on(
    DocumentDetailsActions.documentDetailsReceived,
    (state: DocumentDetailsState, { details }): DocumentDetailsState => ({
      ...state,
      details,
      detailsLoadingIndicator: false,
      detailsLoaded: true,
    })
  ),
  on(
    DocumentDetailsActions.documentDetailsLoadingFailed,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      details: undefined,
      detailsLoadingIndicator: false,
      detailsLoaded: false,
    })
  ),
  on(
    DocumentDetailsActions.navigatedToDetailsPage,
    (): DocumentDetailsState => ({
      ...initialState,
      detailsLoadingIndicator: true,
    })
  ),
  on(
    DocumentDetailsActions.editButtonClicked,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      editMode: true,
    })
  ),
  on(
    DocumentDetailsActions.saveButtonClicked,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      isSubmitting: true,
    })
  ),
  on(
    DocumentDetailsActions.cancelEditConfirmClicked,
    DocumentDetailsActions.cancelEditNotDirty,
    DocumentDetailsActions.updateDocumentCancelled,
    DocumentDetailsActions.updateDocumentSucceeded,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      editMode: false,
      isSubmitting: false,
    })
  ),
  on(
    DocumentDetailsActions.updateDocumentFailed,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      isSubmitting: false,
    })
  ),
  on(
    DocumentCreateOperationsActions.requestDocumentUploadUrls,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      isSubmitting: true,
    })
  ),
  on(
    DocumentCreateOperationsActions.documentCreationCompleted,
    DocumentCreateOperationsActions.documentCreationFinalStepFailed,
    DocumentCreateOperationsActions.attachmentUploadFailed,
    (state: DocumentDetailsState): DocumentDetailsState => ({
      ...state,
      isSubmitting: false,
    })
  )
);
