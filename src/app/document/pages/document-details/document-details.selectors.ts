import { createSelector } from '@ngrx/store';
import { createChildSelectors } from '@onecx/ngrx-accelerator';
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors';
import { DocumentDetail, SupportedMimeType } from '../../../shared/generated';
import { documentFeature } from '../../document.reducers';
import { documentCreateOperationsSelectors } from '../../operations/document-create-operations.selectors';
import { initialState } from './document-details.reducers';
import { DocumentDetailsViewModel } from './document-details.viewmodel';
import { SelectItem } from 'primeng/api';

export const documentDetailsSelectors = createChildSelectors(
  documentFeature.selectDetails,
  initialState
);

export const selectDocumentTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableDocumentTypes,
  (types): SelectItem[] =>
    types.map((type) => ({
      label: type.name,
      value: type.id,
    }))
);

export const selectMimeTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableMimeTypes,
  (mimeTypes: SupportedMimeType[]): SelectItem[] =>
    mimeTypes.map((mimeType) => ({
      label: mimeType.name,
      value: mimeType.id,
    }))
);

export const selectDocumentDetailsViewModel = createSelector(
  documentDetailsSelectors.selectDetails,
  documentDetailsSelectors.selectDetailsLoadingIndicator,
  selectBackNavigationPossible,
  documentDetailsSelectors.selectDetailsLoaded,
  documentDetailsSelectors.selectEditMode,
  documentDetailsSelectors.selectIsSubmitting,
  (
    details: DocumentDetail | undefined,
    detailsLoadingIndicator: boolean,
    backNavigationPossible: boolean,
    detailsLoaded: boolean,
    editMode: boolean,
    isSubmitting: boolean
  ): DocumentDetailsViewModel => ({
    details,
    detailsLoadingIndicator,
    backNavigationPossible,
    detailsLoaded,
    editMode,
    isSubmitting,
  })
);
