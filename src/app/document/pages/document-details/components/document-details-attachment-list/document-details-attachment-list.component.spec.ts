import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { DocumentDetailsAttachmentListComponent } from './document-details-attachment-list.component'

describe('DocumentDetailsAttachmentListComponent', () => {
  let component: DocumentDetailsAttachmentListComponent

  function buildAttachmentFormGroup(overrides: Record<string, any> = {}): FormGroup {
    return new FormGroup({
      id: new FormControl(overrides['id'] ?? 'att-1'),
      name: new FormControl(overrides['name'] ?? 'file.pdf'),
      description: new FormControl(overrides['description'] ?? null),
      fileName: new FormControl(overrides['fileName'] ?? 'file.pdf'),
      type: new FormControl(overrides['type'] ?? null),
      size: new FormControl(overrides['size'] ?? 1024),
      sizeUnit: new FormControl(overrides['sizeUnit'] ?? null),
      mimeType: new FormControl(overrides['mimeType'] ?? 'application/pdf'),
      storageUploadStatus: new FormControl(overrides['storageUploadStatus'] ?? true)
    })
  }

  beforeEach(() => {
    component = new DocumentDetailsAttachmentListComponent()
    component.attachments = new FormArray([buildAttachmentFormGroup()])
  })

  describe('onDownloadClicked', () => {
    it('should emit download event with the attachment raw value', () => {
      const emitted: any[] = []
      component.download.subscribe((v) => emitted.push(v))

      const group = buildAttachmentFormGroup({
        id: 'att-42',
        name: 'report.pdf'
      })
      component.onDownloadClicked(group)

      expect(emitted).toHaveLength(1)
      expect(emitted[0].id).toBe('att-42')
      expect(emitted[0].name).toBe('report.pdf')
    })
  })

  describe('trackByIndex', () => {
    it('should return the provided index', () => {
      expect(component.trackByIndex(5)).toBe(5)
    })
  })

  describe('getUploadStatusKey', () => {
    it('should return UPLOADED key when storageUploadStatus is true', () => {
      const group = buildAttachmentFormGroup({ storageUploadStatus: true })
      expect(component.getUploadStatusKey(group)).toBe('DOCUMENT_DETAILS.ATTACHMENTS.STATUS.UPLOADED')
    })

    it('should return FAILED key when storageUploadStatus is false', () => {
      const group = buildAttachmentFormGroup({ storageUploadStatus: false })
      expect(component.getUploadStatusKey(group)).toBe('DOCUMENT_DETAILS.ATTACHMENTS.STATUS.FAILED')
    })

    it('should return FAILED key when storageUploadStatus control value is null', () => {
      const group = new FormGroup({
        id: new FormControl('att-1'),
        name: new FormControl('file.pdf'),
        description: new FormControl(null),
        fileName: new FormControl('file.pdf'),
        type: new FormControl(null),
        size: new FormControl(1024),
        sizeUnit: new FormControl(null),
        mimeType: new FormControl('application/pdf'),
        storageUploadStatus: new FormControl(null)
      })
      expect(component.getUploadStatusKey(group)).toBe('DOCUMENT_DETAILS.ATTACHMENTS.STATUS.FAILED')
    })

    it('should return FAILED key when storageUploadStatus control does not exist in form group', () => {
      const group = new FormGroup({ id: new FormControl('att-1') })
      expect(component.getUploadStatusKey(group)).toBe('DOCUMENT_DETAILS.ATTACHMENTS.STATUS.FAILED')
    })
  })

  describe('onRetryUploadClicked', () => {
    it('should emit retryUpload event with id and fileName when onRetryUploadClicked is called', () => {
      const emitted: { id: string; fileName: string }[] = []
      component.retryUpload.subscribe((v) => emitted.push(v))

      const group = buildAttachmentFormGroup({
        id: 'att-5',
        fileName: 'document.pdf'
      })
      component.onRetryUploadClicked(group)

      expect(emitted).toHaveLength(1)
      expect(emitted[0]).toEqual({ id: 'att-5', fileName: 'document.pdf' })
    })
  })
})
