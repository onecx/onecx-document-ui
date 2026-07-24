import { createActionGroup, emptyProps, props } from '@ngrx/store'
import {
  AttachmentDraft,
  DocumentCharacteristicFormValue,
  DocumentDetailsFormValue
} from '../../types/document-create.types'
import { DocumentCreateStep } from '../../types/document-create-step.enum'

export const DocumentCreateActions = createActionGroup({
  source: 'DocumentCreate',
  events: {
    'entered page': emptyProps(),
    'go to previous step': props<{ currentStep: DocumentCreateStep }>(),
    'back clicked': emptyProps(),
    'go to next step': props<{ currentStep: DocumentCreateStep }>(),
    'details step patched': props<{
      details: Partial<Omit<DocumentDetailsFormValue, 'attachments' | 'characteristics'>>
    }>(),
    'attachments step patched': props<{
      attachments: AttachmentDraft[]
    }>(),
    'characteristics step patched': props<{
      characteristics: DocumentCharacteristicFormValue[]
    }>(),
    'step validation failed': props<{ error: string }>(),
    'attachment mime type not supported': props<{ fileName: string }>(),
    'submit clicked': emptyProps(),
    'submit finished': emptyProps(),
    'reset clicked': emptyProps(),
    'clear error': emptyProps()
  }
})
