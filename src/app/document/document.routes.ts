import { Routes } from '@angular/router';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';

export const routes: Routes = [
  { path: '', component: DocumentSearchComponent, pathMatch: 'full' },
  { path: 'quick-upload', component: DocumentQuickUploadComponent },
];
