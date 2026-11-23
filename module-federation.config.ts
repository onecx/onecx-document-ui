import { ModuleFederationConfig } from '@nx/module-federation'
import { getOneCXSharedRecommendations } from '@onecx/accelerator'

const config: ModuleFederationConfig = {
  name: 'onecx-document-ui',
  exposes: {
    './OnecxDocumentUiModule': './src/main.ts'
  },
  shared: (libraryName, sharedConfig) => {
    const config = getOneCXSharedRecommendations(libraryName, sharedConfig)
    return config
  }
}

export default config
