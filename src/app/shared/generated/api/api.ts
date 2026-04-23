export * from './documentController.service';
import { DocumentController } from './documentController.service';
export * from './documentSpecificationController.service';
import { DocumentSpecificationController } from './documentSpecificationController.service';
export * from './documentTypeController.service';
import { DocumentTypeController } from './documentTypeController.service';
export * from './supportedMimeTypeController.service';
import { SupportedMimeTypeController } from './supportedMimeTypeController.service';
export const APIS = [DocumentController, DocumentSpecificationController, DocumentTypeController, SupportedMimeTypeController];
