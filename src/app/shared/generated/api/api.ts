export * from './documentControllerV1.service';
import { DocumentControllerV1 } from './documentControllerV1.service';
export * from './documentSpecificationControllerV1.service';
import { DocumentSpecificationControllerV1 } from './documentSpecificationControllerV1.service';
export * from './documentTypeControllerV1.service';
import { DocumentTypeControllerV1 } from './documentTypeControllerV1.service';
export * from './supportedMimeTypeControllerV1.service';
import { SupportedMimeTypeControllerV1 } from './supportedMimeTypeControllerV1.service';
export const APIS = [DocumentControllerV1, DocumentSpecificationControllerV1, DocumentTypeControllerV1, SupportedMimeTypeControllerV1];
