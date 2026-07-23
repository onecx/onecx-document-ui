import { bootstrapModule } from '@onecx/angular-webcomponents';
import { environment } from 'src/environments/environment';
import { OneCXDocumentModule } from './app/onecx-document-ui-app.remote.module';

bootstrapModule(OneCXDocumentModule, 'microfrontend', environment.production);
