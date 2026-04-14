import { routes } from './document.routes';
import { DocumentCreateComponent } from './pages/document-create/document-create.component';
import { DocumentDetailsComponent } from './pages/document-details/document-details.component';
import { DocumentQuickUploadComponent } from './pages/document-quick-upload/document-quick-upload.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';

describe('document.routes', () => {
  it('should configure details route when route list is defined', () => {
    expect(routes[0]).toEqual({
      path: 'details/:id',
      component: DocumentDetailsComponent,
      pathMatch: 'full',
    });
  });

  it('should configure search route as default when route list is defined', () => {
    expect(routes[1]).toEqual({
      path: '',
      component: DocumentSearchComponent,
      pathMatch: 'full',
    });
  });

  it('should configure create route when route list is defined', () => {
    expect(routes[2]).toEqual({
      path: 'create-document',
      component: DocumentCreateComponent,
    });
  });

  it('should configure quick upload route when route list is defined', () => {
    expect(routes[3]).toEqual({
      path: 'quick-upload',
      component: DocumentQuickUploadComponent,
    });
  });
});
