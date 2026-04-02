import { FormControl, FormGroup } from '@angular/forms';
import {
  formatBytes,
  noSpecialCharacters,
  trimSpaces,
} from './attachment.utils';

describe('attachment.utils', () => {
  describe('trimSpaces', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = new FormGroup({
        documentName: new FormControl('existing'),
      });
    });

    it('should trim and prepend pasted value when clipboard data starts with space', () => {
      const event = {
        clipboardData: { getData: () => ' pasted text' },
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      trimSpaces(event, 'documentName', form);

      expect(form.controls['documentName'].value).toBe('existingpasted text');
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not modify form when clipboard data does not start with space', () => {
      const event = {
        clipboardData: { getData: () => 'no-leading-space' },
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      trimSpaces(event, 'documentName', form);

      expect(form.controls['documentName'].value).toBe('existing');
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should truncate combined value to maxlength when provided', () => {
      const event = {
        clipboardData: { getData: () => ' long pasted value' },
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      trimSpaces(event, 'documentName', form, 10);

      const value = form.controls['documentName'].value;
      expect(value.length).toBeLessThanOrEqual(10);
    });

    it('should strip newlines from pasted value', () => {
      const event = {
        clipboardData: { getData: () => ' line1\nline2' },
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      trimSpaces(event, 'documentName', form);

      expect(form.controls['documentName'].value).toContain('line1line2');
      expect(form.controls['documentName'].value).not.toContain('\n');
    });

    it('should handle empty control value gracefully', () => {
      form.controls['documentName'].setValue('');
      const event = {
        clipboardData: { getData: () => ' pasted' },
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      trimSpaces(event, 'documentName', form);

      expect(form.controls['documentName'].value).toBe('pasted');
    });
  });

  describe('formatBytes', () => {
    it('should return "-" for null', () => {
      expect(formatBytes(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatBytes(undefined)).toBe('-');
    });

    it('should return "0 Bytes" for 0', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should return "-" for negative values', () => {
      expect(formatBytes(-1)).toBe('-');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should respect custom decimal places', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
    });

    it('should default decimals to 0 when decimals param is negative', () => {
      const result = formatBytes(1500, -1);
      expect(result).toMatch(/^\d+ KB$/);
    });
  });

  describe('noSpecialCharacters', () => {
    it('should return null for value without special characters', () => {
      const control = new FormControl('valid-document_name 123');
      expect(noSpecialCharacters(control)).toBeNull();
    });

    it('should return validation error for value containing backslash', () => {
      const control = new FormControl('bad\\name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing forward slash', () => {
      const control = new FormControl('bad/name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing colon', () => {
      const control = new FormControl('bad:name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing asterisk', () => {
      const control = new FormControl('bad*name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing question mark', () => {
      const control = new FormControl('bad?name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing double quote', () => {
      const control = new FormControl('bad"name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing angle brackets', () => {
      const control = new FormControl('bad<name>');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });

    it('should return validation error for value containing pipe', () => {
      const control = new FormControl('bad|name');
      expect(noSpecialCharacters(control)).toEqual({ hasSpecialChars: true });
    });
  });
});

describe('trimSpaces – clipboardData null branch', () => {
  it('should return form unchanged when clipboardData is null', () => {
    const form = new FormGroup({ documentName: new FormControl('existing') });
    const event = { clipboardData: null, preventDefault: jest.fn() } as any;

    const result = trimSpaces(event, 'documentName', form);

    expect(result).toBe(form);
    expect(form.controls['documentName'].value).toBe('existing');
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
