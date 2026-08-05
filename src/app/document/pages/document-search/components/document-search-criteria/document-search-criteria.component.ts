import { Component, Input, QueryList, ViewChildren } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'
import { DatePicker } from 'primeng/datepicker'
import { FloatLabelModule } from 'primeng/floatlabel'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { SelectModule } from 'primeng/select'
import { TooltipModule } from 'primeng/tooltip'

@Component({
  selector: 'app-document-search-criteria',
  imports: [
    TooltipModule,
    TranslateModule,
    ReactiveFormsModule,
    DatePicker,
    MultiSelectModule,
    InputTextModule,
    SelectModule,
    FloatLabelModule,
    FloatLabelModule
  ],
  templateUrl: './document-search-criteria.component.html'
})
export class DocumentSearchCriteriaComponent {
  @ViewChildren(DatePicker) calendars!: QueryList<DatePicker>

  @Input() formGroup!: FormGroup
  @Input() viewMode: string | null = 'basic'
  @Input() availableDocumentTypes: SelectItem[] = []
  @Input() availableChannels: SelectItem[] = []
  @Input() lifeCycleStates: SelectItem[] = []
}
