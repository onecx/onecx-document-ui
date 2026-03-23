import { bootstrapModule } from '@onecx/angular-webcomponents';
import { environment } from 'src/environments/environment';
import { OnecxDocumentManagementUiModule } from './app/onecx-document-management-ui-app.remote.module';

bootstrapModule(
  OnecxDocumentManagementUiModule,
  'microfrontend',
  environment.production
);
