import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { createDocumentDetailsSectionForm } from '../../../../utils/document-details-form.factory';
import {
  DocumentCreateDetailsFormGroup,
  DocumentCreateDetailsStepData,
} from '../../../../types/document-create.types';

@Component({
  selector: 'app-document-create-details-form',
  templateUrl: './document-create-details-form.component.html',
  styleUrls: ['./document-create-details-form.component.scss'],
})
export class DocumentCreateDetailsFormComponent implements OnInit {
  @Input() details: Partial<DocumentCreateDetailsStepData> | null = null;
  @Input() availableTypes: SelectItem[] = [];

  @Output() next = new EventEmitter<Partial<DocumentCreateDetailsStepData>>();

  readonly formGroup: DocumentCreateDetailsFormGroup =
    createDocumentDetailsSectionForm();

  ngOnInit(): void {
    if (this.details) {
      this.formGroup.patchValue(this.details, { emitEvent: false });
      this.formGroup.markAsPristine();
    }
  }

  onNextClick(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.next.emit(this.formGroup.getRawValue());
  }
}
