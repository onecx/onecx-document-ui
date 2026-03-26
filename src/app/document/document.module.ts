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
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '../shared/shared.module';
import { documentFeature } from './document.reducers';
import { routes } from './document.routes';
import { DocumentCreateOperationsEffects } from './operations/document-create-operations.effects';
import { DocumentQuickUploadFormComponent } from './pages/document-quick-upload/document-quick-upload-form/document-quick-upload-form.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentSearchCriteriaComponent } from './pages/document-search/components/document-search-criteria/document-search-criteria.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';
import { DocumentSearchEffects } from './pages/document-search/document-search.effects';
import { DocumentDetailsAttachmentListComponent } from './pages/document-details/components/document-details-attachment-list/document-details-attachment-list.component';
import { DocumentDetailsFormComponent } from './pages/document-details/components/document-details-form/document-details-form.component';

@NgModule({
  providers: [providePortalDialogService()],
  declarations: [
    DocumentDetailsComponent,
    DocumentSearchComponent,
    DocumentSearchCriteriaComponent,
    DocumentQuickUploadComponent,
    DocumentQuickUploadFormComponent,
    DocumentDetailsFormComponent,
    DocumentDetailsAttachmentListComponent,
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
    TableModule,
    TabViewModule,
    TooltipModule,
    StoreModule.forFeature(documentFeature),
    EffectsModule.forFeature([
      DocumentDetailsEffects,
      DocumentSearchEffects,
      DocumentCreateOperationsEffects,
    ]),
    TranslateModule,
  ],
})
export class DocumentModule {}
