import { combineReducers, createFeature } from '@ngrx/store';
import { DocumentState } from './document.state';
import { documentDetailsReducer } from './pages/document-details/document-details.reducers';
import { documentQuickUploadReducer } from './pages/document-quick-upload/document-quick-upload.reducers';
import { documentSearchReducer } from './pages/document-search/document-search.reducers';

export const documentFeature = createFeature({
  name: 'document',
  reducer: combineReducers<DocumentState>({
    details: documentDetailsReducer,
    search: documentSearchReducer,
    quickUpload: documentQuickUploadReducer,
  }),
});
