import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { providePortalDialogService } from '@onecx/portal-integration-angular';
import { DocumentDetailsComponent } from './pages/document-details/document-details.component';
import { DocumentDetailsEffects } from './pages/document-details/document-details.effects';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface';
import { PortalCoreModule } from '@onecx/portal-integration-angular';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '../shared/shared.module';
import { documentFeature } from './document.reducers';
import { routes } from './document.routes';
import { DocumentCreateOperationsEffects } from './operations/document-create-operations.effects';
import { DocumentCreateComponent } from './pages/document-create/document-create.component';
import { DocumentCreateEffects } from './pages/document-create/document-create.effects';
import { DocumentCreateAttachmentsComponent } from './pages/document-create/components/document-create-attachments/document-create-attachments.component';
import { DocumentCreateCharacteristicsComponent } from './pages/document-create/components/document-create-characteristics/document-create-characteristics.component';
import { DocumentCreateDetailsFormComponent } from './pages/document-create/components/document-create-details-form/document-create-details-form.component';
import { DocumentQuickUploadFormComponent } from './pages/document-quick-upload/document-quick-upload-form/document-quick-upload-form.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentSearchCriteriaComponent } from './pages/document-search/components/document-search-criteria/document-search-criteria.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';
import { DocumentSearchEffects } from './pages/document-search/document-search.effects';
import { DocumentDetailsAttachmentListComponent } from './pages/document-details/components/document-details-attachment-list/document-details-attachment-list.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DocumentDetailsFormComponent } from './components/document-details-form/document-details-form.component';
import { DocumentDetailsCharacteristicsComponent } from './pages/document-details/components/document-details-characteristics/document-details-characteristics.component';
import { RetryFileUploadDialogComponent } from './pages/document-details/dialog/retry-file-upload-dialog/retry-file-upload-dialog.component';

@NgModule({
  providers: [providePortalDialogService()],
  declarations: [
    DocumentCreateComponent,
    DocumentCreateDetailsFormComponent,
    DocumentCreateAttachmentsComponent,
    DocumentCreateCharacteristicsComponent,
    DocumentDetailsComponent,
    DocumentSearchComponent,
    DocumentSearchCriteriaComponent,
    DocumentQuickUploadComponent,
    DocumentQuickUploadFormComponent,
    DocumentDetailsFormComponent,
    DocumentDetailsAttachmentListComponent,
    DocumentDetailsCharacteristicsComponent,
    FileUploadComponent,
    RetryFileUploadDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    LetDirective,
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forChild(addInitializeModuleGuard(routes)),
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    StepsModule,
    TableModule,
    TabViewModule,
    TooltipModule,
    InputTextareaModule,
    StoreModule.forFeature(documentFeature),
    EffectsModule.forFeature([
      DocumentCreateEffects,
      DocumentDetailsEffects,
      DocumentSearchEffects,
      DocumentCreateOperationsEffects,
    ]),
    TranslateModule,
  ],
})
export class DocumentModule {}
