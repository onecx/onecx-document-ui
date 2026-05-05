import { Routes } from '@angular/router';
import { DocumentCreateComponent } from './pages/document-create/document-create.component';
import { DocumentDetailsComponent } from './pages/document-details/document-details.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';
import { DocumentTypeSearchComponent } from './pages/document-type-search/document-type-search.component';

export const routes: Routes = [
  {
    path: 'details/:id',
    component: DocumentDetailsComponent,
    pathMatch: 'full',
  },
  { path: '', component: DocumentSearchComponent, pathMatch: 'full' },
  { path: 'create-document', component: DocumentCreateComponent },
  { path: 'quick-upload', component: DocumentQuickUploadComponent },
  {
    path: 'document-types',
    component: DocumentTypeSearchComponent,
    pathMatch: 'full',
  },
];
