import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'app-document-search-criteria',
  templateUrl: './document-search-criteria.component.html',
})
export class DocumentSearchCriteriaComponent {
  @ViewChildren(Calendar) calendars!: QueryList<Calendar>;

  @Input() formGroup!: FormGroup;
  @Input() viewMode: string | null = 'basic';
  @Input() availableDocumentTypes: SelectItem[] = [];
  @Input() availableChannels: SelectItem[] = [];
  @Input() lifeCycleStates: SelectItem[] = [];
}
