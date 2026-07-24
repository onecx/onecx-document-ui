import { DocumentDetail } from 'src/app/shared/generated'

export interface DocumentDetailsViewModel {
  details: DocumentDetail | undefined
  detailsLoadingIndicator: boolean
  backNavigationPossible: boolean
  detailsLoaded: boolean
  editMode: boolean
  isSubmitting: boolean
}
