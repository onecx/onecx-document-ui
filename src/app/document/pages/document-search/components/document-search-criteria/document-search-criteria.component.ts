import { Component, Input, QueryList, ViewChildren } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { DatePickerModule } from 'primeng/datepicker'

@Component({
  selector: 'app-document-search-criteria',
  templateUrl: './document-search-criteria.component.html'
})
export class DocumentSearchCriteriaComponent {
  @ViewChildren(DatePickerModule) calendars!: QueryList<DatePickerModule>

  @Input() formGroup!: FormGroup
  @Input() viewMode: string | null = 'basic'
  @Input() availableDocumentTypes: SelectItem[] = []
  @Input() availableChannels: SelectItem[] = []
  @Input() lifeCycleStates: SelectItem[] = []
}
