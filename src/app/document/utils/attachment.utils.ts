import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * @param event
 * @param controlName
 * @param form
 * @param maxlength
 * @returns trim value which removes empty space from starting position
 */
export function trimSpaces(
  event: ClipboardEvent,
  controlName: string,
  form: any,
  maxlength?: number
) {
  let fieldVal = form.controls[controlName].value;
  if (fieldVal == '' || fieldVal == null) fieldVal = '';
  if (event.clipboardData?.getData('text').startsWith(' ')) {
    let pasteVal = event.clipboardData.getData('text').trim();
    let value = fieldVal + pasteVal.split('\n').join('');
    event.preventDefault();
    if (maxlength) {
      value = value.substring(0, maxlength);
    }
    form.controls[controlName].setValue(value);
  }
  return form;
}
/**
 * @param control
 * validate special characters : / \ : * ? < > | "  in the form filed
 */
export function noSpecialCharacters(
  control: AbstractControl
): ValidationErrors | null {
  const pattern = /[\\/:*?<>|"]/;
  if (pattern.test(control.value)) return { hasSpecialChars: true };
  return null;
}
