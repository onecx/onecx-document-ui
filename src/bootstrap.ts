import { bootstrapModule } from '@onecx/angular-webcomponents';
import { environment } from 'src/environments/environment';
import { OnecxDocumentUiModule } from './app/onecx-document-ui-app.remote.module';

bootstrapModule(OnecxDocumentUiModule, 'microfrontend', environment.production);
