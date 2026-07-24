import { DocumentCreateStep } from '../../types/document-create-step.enum'
import {
  AttachmentDraft,
  DocumentCharacteristicFormValue,
  DocumentCreateDetailsStepData
} from '../../types/document-create.types'

export interface DocumentCreateViewModel {
  activeStep: DocumentCreateStep
  details: Partial<DocumentCreateDetailsStepData> | null
  attachments: AttachmentDraft[]
  characteristics: DocumentCharacteristicFormValue[]
  submitting: boolean
  referenceDataLoading: boolean
  referenceDataLoaded: boolean
  error: string | null
}
