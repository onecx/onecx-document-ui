import { Routes } from '@angular/router';
import { DocumentDetailsComponent } from './pages/document-details/document-details.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';

export const routes: Routes = [
  {
    path: 'details/:id',
    component: DocumentDetailsComponent,
    pathMatch: 'full',
  },
  { path: '', component: DocumentSearchComponent, pathMatch: 'full' },
  { path: 'quick-upload', component: DocumentQuickUploadComponent },
];
