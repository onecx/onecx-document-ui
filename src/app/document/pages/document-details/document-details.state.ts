import {
  DocumentDetail,
  DocumentType,
  SupportedMimeType,
} from '../../../shared/generated';

export interface DocumentDetailsState {
  details: DocumentDetail | undefined;
  detailsLoadingIndicator: boolean;
  detailsLoaded: boolean;
  editMode: boolean;
  isSubmitting: boolean;
  availableDocumentTypes: DocumentType[];
  availableMimeTypes: SupportedMimeType[];
}
