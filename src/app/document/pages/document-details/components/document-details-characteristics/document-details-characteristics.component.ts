import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormArray, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { ButtonModule } from 'primeng/button'
import { FluidModule } from 'primeng/fluid'
import { InputTextModule } from 'primeng/inputtext'
import { TableModule } from 'primeng/table'
import { TooltipModule } from 'primeng/tooltip'
import { DocumentCharacteristicsFormGroup } from 'src/app/document/types/document-create.types'

@Component({
  selector: 'app-document-details-characteristics',
  imports: [
    CommonModule,
    TranslateModule,
    FluidModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    TableModule
  ],
  templateUrl: './document-details-characteristics.component.html'
})
export class DocumentDetailsCharacteristicsComponent {
  @Input() characteristics!: FormArray<DocumentCharacteristicsFormGroup>
  @Input() editMode = false

  @Output() characteristicAdded: EventEmitter<void> = new EventEmitter()
  @Output() characteristicRemoved: EventEmitter<number> = new EventEmitter()

  trackByIndex(index: number): number {
    return index
  }

  onRowDelete(index: number) {
    this.characteristicRemoved.emit(index)
  }

  onAddRow() {
    this.characteristicAdded.emit()
  }
}
