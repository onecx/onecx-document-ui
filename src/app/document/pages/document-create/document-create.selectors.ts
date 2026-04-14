import { createSelector } from '@ngrx/store';
import { createChildSelectors } from '@onecx/ngrx-accelerator';
import { SelectItem } from 'primeng/api';
import { documentFeature } from '../../document.reducers';
import { documentCreateOperationsSelectors } from '../../operations/document-create-operations.selectors';
import { initialState } from './document-create.reducers';
import { DocumentCreateViewModel } from './document-create.viewmodel';

export const documentCreateSelectors = createChildSelectors(
  documentFeature.selectCreate,
  initialState
);

export const selectCreateDocumentTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableDocumentTypes,
  (types): SelectItem[] =>
    types.map((type) => ({
      label: type.name,
      value: type.id,
    }))
);

export const selectCreateMimeTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableMimeTypes,
  (mimeTypes): SelectItem[] =>
    mimeTypes.map((mimeType) => ({
      label: mimeType.name,
      value: mimeType.id,
    }))
);

const selectDocumentCreateFormState = createSelector(
  documentCreateSelectors.selectActiveStep,
  documentCreateSelectors.selectDetails,
  documentCreateSelectors.selectAttachments,
  documentCreateSelectors.selectCharacteristics,
  (activeStep, details, attachments, characteristics) => ({
    activeStep,
    details,
    attachments,
    characteristics,
  })
);

const selectDocumentCreateStatusState = createSelector(
  documentCreateSelectors.selectSubmitting,
  documentCreateSelectors.selectReferenceDataLoading,
  documentCreateSelectors.selectReferenceDataLoaded,
  documentCreateSelectors.selectError,
  (submitting, referenceDataLoading, referenceDataLoaded, error) => ({
    submitting,
    referenceDataLoading,
    referenceDataLoaded,
    error,
  })
);

export const selectDocumentCreateViewModel = createSelector(
  selectDocumentCreateFormState,
  selectDocumentCreateStatusState,
  (formState, statusState): DocumentCreateViewModel => ({
    ...formState,
    ...statusState,
  })
);

export const selectCanGoNextFromAttachments = createSelector(
  documentCreateSelectors.selectAttachments,
  (attachments) => attachments.length > 0
);

export const selectDocumentCreateSubmissionSource = createSelector(
  documentCreateSelectors.selectDetails,
  documentCreateSelectors.selectAttachments,
  documentCreateSelectors.selectCharacteristics,
  (details, attachments, characteristics) => ({
    details,
    attachments,
    characteristics,
  })
);
