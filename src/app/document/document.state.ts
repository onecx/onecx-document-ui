import { DocumentSearchState } from './pages/document-search/document-search.state';
import { DocumentQuickUploadState } from './pages/document-quick-upload/document-quick-upload.state';
export interface DocumentState {
  search: DocumentSearchState;
  quickUpload: DocumentQuickUploadState;
}
