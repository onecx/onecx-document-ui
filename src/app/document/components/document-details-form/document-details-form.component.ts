import { Component, Input, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { LifeCycleState } from 'src/app/shared/generated/model/lifeCycleState';
import {
  DocumentCreateDetailsFormGroup,
  DocumentDetailsFormGroup,
} from '../../types/document-create.types';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-document-details-form',
  templateUrl: './document-details-form.component.html',
  styleUrl: './document-details-form.component.scss',
})
export class DocumentDetailsFormComponent implements OnInit {
  @Input() formGroup!:
    | DocumentDetailsFormGroup
    | DocumentCreateDetailsFormGroup;
  @Input() availableTypes: SelectItem[] = [];
  @Input() availableStatuses: SelectItem[] = [];

  documentStatuses: SelectItem[] = [];

  ngOnInit(): void {
    this.loadDocumentStatus();
  }

  isInvalid(controlName: string): boolean {
    const control = (this.formGroup as FormGroup).get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private loadDocumentStatus(): void {
    this.documentStatuses = Object.keys(LifeCycleState).map((key) => ({
      label: key,
      value: LifeCycleState[key as keyof typeof LifeCycleState],
    }));
  }
}
