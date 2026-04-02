import { FormControl, FormGroup } from '@angular/forms';
import { LifeCycleState } from 'src/app/shared/generated/model/lifeCycleState';
import { DocumentDetailsFormComponent } from './document-details-form.component';
import { createDocumentDetailsSectionForm } from '../../utils/document-details-form.factory';

describe('DocumentDetailsFormComponent', () => {
  let component: DocumentDetailsFormComponent;

  beforeEach(() => {
    component = new DocumentDetailsFormComponent();
    component.formGroup = createDocumentDetailsSectionForm() as any;
    component.ngOnInit();
  });

  describe('ngOnInit', () => {
    it('should populate documentStatuses from LifeCycleState enum', () => {
      const expectedKeys = Object.keys(LifeCycleState);
      expect(component.documentStatuses).toHaveLength(expectedKeys.length);
      expect(component.documentStatuses[0].label).toBeDefined();
      expect(component.documentStatuses[0].value).toBeDefined();
    });

    it('should map LifeCycleState enum values as SelectItem values', () => {
      const values = component.documentStatuses.map((s) => s.value);
      Object.values(LifeCycleState).forEach((v) => {
        expect(values).toContain(v);
      });
    });
  });

  describe('isInvalid', () => {
    it('should return false when control is valid', () => {
      component.formGroup.patchValue({
        name: 'Valid Name',
        type: 't1',
        channel: 'ch1',
        status: 'Draft',
      });
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return false when control is invalid but not touched or dirty', () => {
      // required field, empty, untouched
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return true when control is invalid and touched', () => {
      const control = (component.formGroup as FormGroup).get('name')!;
      control.markAsTouched();
      expect(component.isInvalid('name')).toBe(true);
    });

    it('should return true when control is invalid and dirty', () => {
      const control = (component.formGroup as FormGroup).get('name')!;
      control.markAsDirty();
      expect(component.isInvalid('name')).toBe(true);
    });

    it('should return false for non-existent control name', () => {
      expect(component.isInvalid('nonExistentField')).toBe(false);
    });
  });
});
