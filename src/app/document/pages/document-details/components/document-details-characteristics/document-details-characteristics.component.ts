import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray } from '@angular/forms';
import { DocumentCharacteristicsFormGroup } from 'src/app/document/types/document-create.types';

@Component({
  selector: 'app-document-details-characteristics',
  templateUrl: './document-details-characteristics.component.html',
  styleUrl: './document-details-characteristics.component.scss',
})
export class DocumentDetailsCharacteristicsComponent {
  @Input() characteristics!: FormArray<DocumentCharacteristicsFormGroup>;
  @Input() editMode = false;

  @Output() characteristicAdded: EventEmitter<void> = new EventEmitter();
  @Output() characteristicRemoved: EventEmitter<number> = new EventEmitter();

  trackByIndex(index: number): number {
    return index;
  }

  onRowDelete(index: number) {
    this.characteristicRemoved.emit(index);
  }

  onAddRow() {
    this.characteristicAdded.emit();
  }
}
