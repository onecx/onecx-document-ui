import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

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
  form: FormGroup,
  maxlength?: number
) {
  let fieldVal = form.controls[controlName].value;
  if (fieldVal === '' || fieldVal === null) {
    fieldVal = '';
  }

  if (event.clipboardData?.getData('text').startsWith(' ')) {
    const pasteVal = event.clipboardData.getData('text').trim();
    let value = fieldVal + pasteVal.split('\n').join('');
    event.preventDefault();

    if (maxlength) {
      value = value.substring(0, maxlength);
    }

    form.controls[controlName].setValue(value);
  }

  return form;
}

export function formatBytes(
  bytes: number | null | undefined,
  decimals = 2
): string {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
    return '-';
  }

  if (bytes === 0) {
    return '0 Bytes';
  }

  if (bytes < 0) {
    return '-';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
