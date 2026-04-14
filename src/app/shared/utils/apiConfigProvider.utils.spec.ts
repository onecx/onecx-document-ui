import {
  AppStateService,
  ConfigurationService,
  PortalApiConfiguration,
} from '@onecx/portal-integration-angular';
import { environment } from 'src/environments/environment';
import { Configuration } from '../generated';
import { apiConfigProvider } from './apiConfigProvider.utils';

jest.mock('@onecx/portal-integration-angular', () => ({
  PortalApiConfiguration: jest.fn(),
}));

describe('apiConfigProvider', () => {
  it('should create PortalApiConfiguration when provider is called', () => {
    const configService = {} as ConfigurationService;
    const appStateService = {} as AppStateService;

    const result = apiConfigProvider(configService, appStateService);

    expect(PortalApiConfiguration).toHaveBeenCalledWith(
      Configuration,
      environment.apiPrefix,
      configService,
      appStateService
    );
    expect(result).toBe(
      (PortalApiConfiguration as jest.Mock).mock.instances[0]
    );
  });
});
