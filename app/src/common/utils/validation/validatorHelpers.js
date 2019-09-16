export const composeValidators = (validators) => (value) =>
  validators.every((validator) => validator(value));

export const trimValue = (value) => (typeof value === 'string' ? value.trim() : value);
export const isEmpty = (value) => {
  const trimmedValue = trimValue(value);
  return trimmedValue === '' || trimmedValue === undefined || trimmedValue === null;
};
export const isNotEmpty = (value) => !isEmpty(value);
export const isNotOnlySpaces = (value) => !value || trimValue(value) !== '';
export const min = (minValue) => (value) => Number(value) >= minValue;
export const max = (maxValue) => (value) => Number(value) <= maxValue;
export const range = (minValue, maxValue) => composeValidators([min(minValue), max(maxValue)]);
export const minLength = (minValue) => (value = '') => min(minValue)(trimValue(value).length);
export const maxLength = (maxValue) => (value = '') => max(maxValue)(value.length);
export const lengthRange = (minValue, maxValue) =>
  composeValidators([minLength(minValue), maxLength(maxValue)]);
export const regex = (regexStr) => (value) => RegExp(regexStr).test(value);

export const bindMessageToValidator = (validator, errorMessage) => (value) =>
  !validator(value) ? errorMessage : undefined;

export const composeBindedValidators = (bindedValidators) => (value) => {
  const failedValidator = bindedValidators.find((validator) => validator(value) !== undefined);
  return failedValidator ? failedValidator(value) : undefined;
};
