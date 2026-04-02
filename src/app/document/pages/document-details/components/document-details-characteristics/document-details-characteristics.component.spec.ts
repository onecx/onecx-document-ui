import { FormArray } from '@angular/forms';
import { DocumentDetailsCharacteristicsComponent } from './document-details-characteristics.component';
import { createCharacteristicFormGroup } from 'src/app/document/utils/document-details-form.factory';

describe('DocumentDetailsCharacteristicsComponent', () => {
  let component: DocumentDetailsCharacteristicsComponent;

  beforeEach(() => {
    component = new DocumentDetailsCharacteristicsComponent();
    component.characteristics = new FormArray([
      createCharacteristicFormGroup({ id: 'c1', name: 'color', value: 'red' } as any),
    ]);
  });

  describe('trackByIndex', () => {
    it('should return the provided index', () => {
      expect(component.trackByIndex(3)).toBe(3);
    });
  });

  describe('onRowDelete', () => {
    it('should emit characteristicRemoved with the given index', () => {
      const emitted: number[] = [];
      component.characteristicRemoved.subscribe((i) => emitted.push(i));

      component.onRowDelete(2);

      expect(emitted).toEqual([2]);
    });
  });

  describe('onAddRow', () => {
    it('should emit characteristicAdded', () => {
      let emitCount = 0;
      component.characteristicAdded.subscribe(() => emitCount++);

      component.onAddRow();

      expect(emitCount).toBe(1);
    });
  });
});
