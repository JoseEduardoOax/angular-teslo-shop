import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/**
 * A custom validator that checks if the control's value is one of the allowed values.
 * @param allowedValues The array of values that are considered valid.
 * @returns A ValidationErrors object if the value is invalid, otherwise null.
 */
export function oneOfValidator(allowedValues: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      // If the field is empty, another validator like `Validators.required` should handle it.
      return null;
    }

    // Check if the current value exists in the allowedValues array
    const isValid = allowedValues.includes(value);

    // If not valid, return a custom error object
    return isValid ? null : { oneOf: { value: control.value, allowedValues: allowedValues } };
  };
}
