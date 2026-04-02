import { combineReducers, createFeature } from '@ngrx/store';
import { documentCreateOperationsReducer } from './operations/document-create-operations.reducers';
import { DocumentState } from './document.state';
import { documentCreateReducer } from './pages/document-create/document-create.reducers';
import { documentDetailsReducer } from './pages/document-details/document-details.reducers';
import { documentQuickUploadReducer } from './pages/document-quick-upload/document-quick-upload.reducers';
import { documentSearchReducer } from './pages/document-search/document-search.reducers';

export const documentFeature = createFeature({
  name: 'document',
  reducer: combineReducers<DocumentState>({
    operations: documentCreateOperationsReducer,
    create: documentCreateReducer,
    details: documentDetailsReducer,
    search: documentSearchReducer,
    quickUpload: documentQuickUploadReducer,
  }),
});
