import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { LifeCycleState } from 'src/app/shared/generated/model/lifeCycleState';

@Component({
  selector: 'app-document-details-form',
  templateUrl: './document-details-form.component.html',
  styleUrl: './document-details-form.component.scss',
})
export class DocumentDetailsFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() availableTypes: SelectItem[] = [];
  @Input() availableStatuses: SelectItem[] = [];

  documentStatuses: SelectItem[] = [];

  ngOnInit(): void {
    this.loadDocumentStatus();
  }

  private loadDocumentStatus(): void {
    this.documentStatuses = Object.keys(LifeCycleState).map((key) => ({
      label: key,
      value: LifeCycleState[key as keyof typeof LifeCycleState],
    }));
  }
}
