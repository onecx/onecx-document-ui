import { DocumentCreateCharacteristicsComponent } from './document-create-characteristics.component';

describe('DocumentCreateCharacteristicsComponent', () => {
  let component: DocumentCreateCharacteristicsComponent;

  beforeEach(() => {
    component = new DocumentCreateCharacteristicsComponent();
  });

  describe('ngOnInit', () => {
    it('should build characteristicsForm from input characteristics', () => {
      component.characteristics = [
        { id: 'c1', name: 'color', value: 'red' },
        { id: 'c2', name: 'size', value: 'large' },
      ] as any;

      component.ngOnInit();

      expect(component.characteristicsForm.length).toBe(2);
      expect(component.characteristicsForm.at(0).controls.name.value).toBe(
        'color'
      );
      expect(component.characteristicsForm.at(1).controls.value.value).toBe(
        'large'
      );
    });

    it('should initialize empty form when characteristics input is empty', () => {
      component.characteristics = [];
      component.ngOnInit();
      expect(component.characteristicsForm.length).toBe(0);
    });

    it('should use undefined for null id, name, and value in characteristic form group', () => {
      component.characteristics = [
        { id: null, name: null, value: null },
      ] as any;

      component.ngOnInit();

      expect(component.characteristicsForm.at(0).controls.id.value).toBeNull();
      expect(
        component.characteristicsForm.at(0).controls.name.value
      ).toBeNull();
      expect(
        component.characteristicsForm.at(0).controls.value.value
      ).toBeNull();
    });
  });

  describe('onBackClick', () => {
    it('should emit back event', () => {
      const emitted: any[] = [];
      component.back.subscribe(() => emitted.push(true));

      component.onBackClick();

      expect(emitted).toHaveLength(1);
    });
  });

  describe('onAddCharacteristic', () => {
    it('should add a new empty form group to characteristicsForm', () => {
      component.ngOnInit();
      component.onAddCharacteristic();

      expect(component.characteristicsForm.length).toBe(1);
      expect(
        component.characteristicsForm.at(0).controls.name.value
      ).toBeNull();
    });
  });

  describe('onRemoveCharacteristic', () => {
    it('should remove the form group at the given index', () => {
      component.characteristics = [
        { id: 'c1', name: 'color', value: 'red' },
        { id: 'c2', name: 'size', value: 'large' },
      ] as any;
      component.ngOnInit();

      component.onRemoveCharacteristic(0);

      expect(component.characteristicsForm.length).toBe(1);
      expect(component.characteristicsForm.at(0).controls.name.value).toBe(
        'size'
      );
    });
  });

  describe('onSaveClick', () => {
    it('should emit save with form raw values when form is valid', () => {
      const emitted: any[] = [];
      component.save.subscribe((v) => emitted.push(v));
      component.characteristics = [
        { id: 'c1', name: 'color', value: 'red' },
      ] as any;
      component.ngOnInit();

      component.onSaveClick();

      expect(emitted).toHaveLength(1);
      expect(emitted[0][0].name).toBe('color');
    });

    it('should not emit save when form is invalid', () => {
      const emitted: any[] = [];
      component.save.subscribe((v) => emitted.push(v));
      component.ngOnInit();
      component.onAddCharacteristic(); // empty group — required fields not filled

      component.onSaveClick();

      expect(emitted).toHaveLength(0);
    });

    it('should mark all controls as touched when form is invalid', () => {
      component.ngOnInit();
      component.onAddCharacteristic();

      component.onSaveClick();

      expect(component.characteristicsForm.at(0).controls.name.touched).toBe(
        true
      );
    });
  });

  describe('trackByIndex', () => {
    it('should return the provided index', () => {
      expect(component.trackByIndex(3)).toBe(3);
    });
  });
});
