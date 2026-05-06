import {
  DataTableColumn,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState,
} from '@onecx/portal-integration-angular';
import { DocumentType } from 'src/app/shared/generated';

export interface DocumentTypeSearchState {
  columns: DataTableColumn[];
  results: DocumentType[];
  loadingIndicator: boolean;
  resultComponentState: InteractiveDataViewComponentState | null;
  searchHeaderComponentState: SearchHeaderComponentState | null;
  dialogVisible: boolean;
  editingDocumentType: DocumentType | null;
}
