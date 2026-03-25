import { createSelector } from '@ngrx/store';
import { createChildSelectors } from '@onecx/ngrx-accelerator';
import { SelectItem } from 'primeng/api';
import { SupportedMimeType } from 'src/app/shared/generated';
import { documentFeature } from '../../document.reducers';
import { initialState } from './document-quick-upload.reducers';

export const documentQuickUploadSelectors = createChildSelectors(
  documentFeature.selectQuickUpload,
  initialState
);

export const selectQuickUploadDocumentTypes = createSelector(
  documentQuickUploadSelectors.selectAvailableDocumentTypes,
  (types): SelectItem[] =>
    types.map((type) => ({
      label: type.name,
      value: type.id,
    }))
);

export const selectQuickUploadMimeTypes = createSelector(
  documentQuickUploadSelectors.selectAvailableMimeTypes,
  (mimeTypes: SupportedMimeType[]): SelectItem[] =>
    mimeTypes.map((mimeType) => ({
      label: mimeType.name,
      value: mimeType.id,
    }))
);
