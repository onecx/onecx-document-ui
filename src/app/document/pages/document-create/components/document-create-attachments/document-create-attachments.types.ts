import { FormControl, FormGroup } from '@angular/forms'

export type AttachmentFormGroup = FormGroup<{
  name: FormControl<string | null>
  mimeType: FormControl<string | null>
  validForEnd: FormControl<string | null>
  description: FormControl<string | null>
}>
