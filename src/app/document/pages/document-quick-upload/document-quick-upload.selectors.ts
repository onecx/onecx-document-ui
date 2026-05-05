import { createSelector } from '@ngrx/store';
import { createChildSelectors } from '@onecx/ngrx-accelerator';
import { SelectItem } from 'primeng/api';
import { documentFeature } from '../../document.reducers';
import { documentCreateOperationsSelectors } from '../../operations/document-create-operations.selectors';
import { initialState } from './document-quick-upload.reducers';

export const documentQuickUploadSelectors = createChildSelectors(
  documentFeature.selectQuickUpload,
  initialState
);

export const selectQuickUploadDocumentTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableDocumentTypes,
  (types): SelectItem[] =>
    types.map((type) => ({
      label: type.name,
      value: type.id,
    }))
);

export const selectQuickUploadMimeTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableMimeTypes,
  (mimeTypes: string[]): SelectItem[] =>
    mimeTypes.map((mimeType) => ({
      label: mimeType,
      value: mimeType,
    }))
);
