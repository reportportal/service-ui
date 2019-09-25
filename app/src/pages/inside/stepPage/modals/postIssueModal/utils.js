import { validate as commonValidate, commonValidators, bindMessageToValidator } from 'common/utils';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_COMMENTS_KEY,
  INCLUDE_LOGS_KEY,
  REQUIRED_KEY,
} from './constants';

const validateNonRequiredField = (value, type, hint) => {
  const fieldValue = value && value[0];
  let isFieldValid = true;
  if (fieldValue) {
    try {
      const parsedFieldValue = JSON.parse(fieldValue);
      // eslint-disable-next-line
      isFieldValid = typeof parsedFieldValue === type;
      // eslint-disable-next-line no-empty
    } catch (e) {
      isFieldValid = false;
    }
  }
  return isFieldValid ? undefined : hint;
};

const validateDoubleField = (value) => validateNonRequiredField(value, 'number', 'doubleFieldHint');

const validateBooleanField = (value) =>
  validateNonRequiredField(value, 'boolean', 'booleanFieldHint');

const FIELDS_VALIDATION_MAP = {
  boolean: validateBooleanField,
  double: validateDoubleField,
  [REQUIRED_KEY]: bindMessageToValidator(commonValidate.isNotEmptyArray, 'requiredFieldHint'),
};

export const validate = (fields, validationConfig) => {
  let validValues = {
    username: commonValidators.requiredField(fields.username),
    password: commonValidators.requiredField(fields.password),
    token: commonValidators.requiredField(fields.token),
  };
  if (validationConfig) {
    const validatedFields = Object.keys(validationConfig).reduce((acc, key) => {
      const validateField = validationConfig[key];
      return validateField ? { ...acc, [key]: validateField(fields[key]) } : acc;
    }, {});

    validValues = Object.assign(validValues, validatedFields);
  }
  return validValues;
};

export const createFieldsValidationConfig = (fields) =>
  fields.reduce((acc, item) => {
    const itemValidationKey = item.required ? REQUIRED_KEY : item.fieldType;
    return { ...acc, [item.id]: FIELDS_VALIDATION_MAP[itemValidationKey] };
  }, {});

export const getDataSectionConfig = (value) => ({
  [INCLUDE_ATTACHMENTS_KEY]: value,
  [INCLUDE_LOGS_KEY]: value,
  [INCLUDE_COMMENTS_KEY]: value,
});
