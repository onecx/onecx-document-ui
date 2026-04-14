import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  DocumentCharacteristicFormValue,
  DocumentCharacteristicsFormGroup,
} from '../../../../types/document-create.types';
import { createCharacteristicFormGroup } from '../../../../utils/document-details-form.factory';

@Component({
  selector: 'app-document-create-characteristics',
  templateUrl: './document-create-characteristics.component.html',
})
export class DocumentCreateCharacteristicsComponent implements OnInit {
  @Input() characteristics: DocumentCharacteristicFormValue[] = [];

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<DocumentCharacteristicFormValue[]>();

  readonly characteristicsForm =
    new FormArray<DocumentCharacteristicsFormGroup>([]);

  ngOnInit(): void {
    this.buildForm();
  }

  onBackClick(): void {
    this.back.emit();
  }

  onAddCharacteristic(): void {
    this.characteristicsForm.push(createCharacteristicFormGroup());
  }

  onRemoveCharacteristic(index: number): void {
    this.characteristicsForm.removeAt(index);
  }

  onSaveClick(): void {
    this.characteristicsForm.markAllAsTouched();
    if (this.characteristicsForm.invalid) {
      return;
    }

    this.save.emit(this.characteristicsForm.getRawValue());
  }

  trackByIndex(index: number): number {
    return index;
  }

  private buildForm(): void {
    this.characteristicsForm.clear();
    this.characteristics.forEach((characteristic) => {
      this.characteristicsForm.push(
        createCharacteristicFormGroup({
          id: characteristic.id ?? undefined,
          name: characteristic.name ?? undefined,
          value: characteristic.value ?? undefined,
        })
      );
    });
  }
}
