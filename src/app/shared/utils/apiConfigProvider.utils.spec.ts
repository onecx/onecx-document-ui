import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { PortalApiConfiguration } from '@onecx/angular-utils'
import { environment } from 'src/environments/environment'
import { Configuration } from '../generated'
import { apiConfigProvider } from './apiConfigProvider.utils'

describe('apiConfigProvider', () => {
  it('should create PortalApiConfiguration when provider is called', () => {
    const configService = {} as ConfigurationService
    const appStateService = {} as AppStateService

    const result = apiConfigProvider()

    expect(PortalApiConfiguration).toHaveBeenCalledWith(
      Configuration,
      environment.apiPrefix,
      configService,
      appStateService
    )
    expect(result).toBe((PortalApiConfiguration as jest.Mock).mock.instances[0])
  })
})
