export * from './documentController.service';
import { DocumentControllerAPIService } from './documentController.service';
export * from './documentSpecificationController.service';
import { DocumentSpecificationControllerAPIService } from './documentSpecificationController.service';
export * from './documentTypeController.service';
import { DocumentTypeControllerAPIService } from './documentTypeController.service';
export * from './supportedMimeTypeController.service';
import { SupportedMimeTypeControllerAPIService } from './supportedMimeTypeController.service';
export const APIS = [DocumentControllerAPIService, DocumentSpecificationControllerAPIService, DocumentTypeControllerAPIService, SupportedMimeTypeControllerAPIService];
