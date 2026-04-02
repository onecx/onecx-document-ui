import { DocumentCreateOperationsState } from './operations/document-create-operations.state';
import { DocumentCreateState } from './pages/document-create/document-create.state';
import { DocumentDetailsState } from './pages/document-details/document-details.state';
import { DocumentQuickUploadState } from './pages/document-quick-upload/document-quick-upload.state';
import { DocumentSearchState } from './pages/document-search/document-search.state';
export interface DocumentState {
  operations: DocumentCreateOperationsState;
  create: DocumentCreateState;
  details: DocumentDetailsState;
  search: DocumentSearchState;
  quickUpload: DocumentQuickUploadState;
}
