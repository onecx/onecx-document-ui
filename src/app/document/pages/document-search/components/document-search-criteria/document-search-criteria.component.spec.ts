import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { CalendarModule } from 'primeng/calendar'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { TooltipModule } from 'primeng/tooltip'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { DocumentSearchCriteriaComponent } from './document-search-criteria.component'

describe('DocumentSearchCriteriaComponent', () => {
  let component: DocumentSearchCriteriaComponent
  let fixture: ComponentFixture<DocumentSearchCriteriaComponent>
  let fb: FormBuilder

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentSearchCriteriaComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        CalendarModule,
        DropdownModule,
        InputTextModule,
        MultiSelectModule,
        TooltipModule,
        TranslateTestingModule.withTranslations('en', require('./../../../../../../assets/i18n/en.json'))
      ]
    }).compileComponents()

    fb = TestBed.inject(FormBuilder)
    fixture = TestBed.createComponent(DocumentSearchCriteriaComponent)
    component = fixture.componentInstance
    component.formGroup = fb.group({
      id: [null],
      name: [null],
      lifeCycleState: [null],
      documentTypeId: [null],
      channelName: [null],
      startDate: [null],
      endDate: [null],
      createBy: [null],
      objectReferenceId: [null],
      objectReferenceType: [null],
      pageNumber: [null],
      pageSize: [null]
    })
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should expose a calendars QueryList used by parent for date conversion', () => {
    expect(component.calendars).toBeDefined()
  })

  it('should default viewMode to basic', () => {
    expect(component.viewMode).toBe('basic')
  })

  it('should default availableDocumentTypes to empty array', () => {
    expect(component.availableDocumentTypes).toEqual([])
  })

  it('should default availableChannels to empty array', () => {
    expect(component.availableChannels).toEqual([])
  })

  it('should default lifeCycleStates to empty array', () => {
    expect(component.lifeCycleStates).toEqual([])
  })
})
