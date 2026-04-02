import {
  AttachmentDraft,
  DocumentCharacteristicFormValue,
  DocumentCreateDetailsStepData,
} from '../../types/document-create.types';
import { DocumentCreateStep } from '../../types/document-create-step.enum';

export interface DocumentCreateState {
  activeStep: DocumentCreateStep;
  details: Partial<DocumentCreateDetailsStepData> | null;
  attachments: AttachmentDraft[];
  characteristics: DocumentCharacteristicFormValue[];
  referenceDataLoading: boolean;
  referenceDataLoaded: boolean;
  documentTypesReceived: boolean;
  mimeTypesReceived: boolean;
  submitting: boolean;
  error: string | null;
}
