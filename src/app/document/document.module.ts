import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface';
import { PortalCoreModule } from '@onecx/portal-integration-angular';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../shared/shared.module';
import { documentFeature } from './document.reducers';
import { routes } from './document.routes';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';
import { DocumentSearchCriteriaComponent } from './pages/document-search/components/document-search-criteria/document-search-criteria.component';
import { DocumentSearchEffects } from './pages/document-search/document-search.effects';
import { DocumentCreateOperationsEffects } from './operations/document-create-operations.effects';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentQuickUploadFormComponent } from './pages/document-quick-upload/document-quick-upload-form/document-quick-upload-form.component';

@NgModule({
  declarations: [
    DocumentSearchComponent,
    DocumentSearchCriteriaComponent,
    DocumentQuickUploadComponent,
    DocumentQuickUploadFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    LetDirective,
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forChild(addInitializeModuleGuard(routes)),
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    StoreModule.forFeature(documentFeature),
    EffectsModule.forFeature([
      DocumentSearchEffects,
      DocumentCreateOperationsEffects,
    ]),
    TranslateModule,
  ],
})
export class DocumentModule {}
