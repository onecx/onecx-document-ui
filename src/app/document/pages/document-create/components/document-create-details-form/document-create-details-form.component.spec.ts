import { TestBed } from '@angular/core/testing'

import { DocumentCreateDetailsFormComponent } from './document-create-details-form.component'

describe('DocumentCreateDetailsFormComponent', () => {
  let component: DocumentCreateDetailsFormComponent

  beforeEach(() => {
    TestBed.configureTestingModule({})
    component = new DocumentCreateDetailsFormComponent()
  })

  describe('ngOnInit', () => {
    it('should patch form with provided details and mark as pristine', () => {
      const details = { name: 'My Document', type: 'type-1', channel: 'ch-1' }
      component.details = details as any

      component.ngOnInit()

      expect(component.formGroup.getRawValue().name).toBe('My Document')
      expect(component.formGroup.pristine).toBe(true)
    })

    it('should leave form untouched when details is null', () => {
      component.details = null
      component.ngOnInit()
      expect(component.formGroup.getRawValue().name).toBeNull()
    })
  })

  describe('onNextClick', () => {
    it('should emit next event with form raw value when form is valid', () => {
      const emittedValues: any[] = []
      component.next.subscribe((v) => emittedValues.push(v))

      component.formGroup.patchValue({
        name: 'Valid Doc',
        type: 'type-1',
        channel: 'ch-1',
        status: 'Draft'
      })

      component.onNextClick()

      expect(emittedValues).toHaveLength(1)
      expect(emittedValues[0].name).toBe('Valid Doc')
    })

    it('should not emit next event when form is invalid', () => {
      const emittedValues: any[] = []
      component.next.subscribe((v) => emittedValues.push(v))

      // required fields are empty
      component.onNextClick()

      expect(emittedValues).toHaveLength(0)
    })

    it('should mark all controls as touched when form is invalid', () => {
      component.onNextClick()

      const nameControl = component.formGroup.get('name')
      expect(nameControl?.touched).toBe(true)
    })
  })

  describe('formGroup validation', () => {
    it('should be invalid when required fields are empty', () => {
      expect(component.formGroup.valid).toBe(false)
    })

    it('should be valid when all required fields are filled', () => {
      component.formGroup.patchValue({
        name: 'Doc',
        type: 'type-1',
        channel: 'ch-1',
        status: 'Draft'
      })
      expect(component.formGroup.valid).toBe(true)
    })

    it('should be invalid when name exceeds 255 characters', () => {
      component.formGroup.patchValue({
        name: 'a'.repeat(256),
        type: 'type-1',
        channel: 'ch-1',
        status: 'Draft'
      })
      expect(component.formGroup.get('name')?.valid).toBe(false)
    })

    it('should be invalid when description exceeds 4000 characters', () => {
      component.formGroup.patchValue({
        name: 'Doc',
        type: 'type-1',
        channel: 'ch-1',
        status: 'Draft',
        description: 'a'.repeat(4001)
      })
      expect(component.formGroup.get('description')?.valid).toBe(false)
    })
  })
})
