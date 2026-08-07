import { PortalApiConfiguration } from '@onecx/angular-utils'
import { environment } from 'src/environments/environment'
import { Configuration } from '../generated'
import { apiConfigProvider } from './apiConfigProvider.utils'

jest.mock('@onecx/angular-utils', () => ({
  PortalApiConfiguration: jest.fn()
}))

describe('apiConfigProvider', () => {
  it('should create PortalApiConfiguration when provider is called', () => {
    const result = apiConfigProvider()

    expect(PortalApiConfiguration).toHaveBeenCalledWith(Configuration, environment.apiPrefix)
    expect(result).toBe((PortalApiConfiguration as jest.Mock).mock.instances[0])
  })
})
