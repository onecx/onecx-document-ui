import { DocumentType, SupportedMimeType } from 'src/app/shared/generated';

export interface DocumentQuickUploadState {
  optionsLoading: boolean;
  mimeTypesLoaded: boolean;
  documentTypesLoaded: boolean;
  availableDocumentTypes: DocumentType[];
  availableMimeTypes: SupportedMimeType[];
}
