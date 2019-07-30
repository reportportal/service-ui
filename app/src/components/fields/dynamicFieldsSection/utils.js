import {
  ARRAY_TYPE,
  DROPDOWN_TYPE,
  DATE_TYPE,
  TEXT_TYPE,
  FIELDS_MAP,
  VALUE_ID_KEY,
  VALUE_NAME_KEY,
} from './constants';

const normalizeDefinedValue = (item) =>
  !item[VALUE_ID_KEY] ? { ...item, [VALUE_ID_KEY]: item[VALUE_NAME_KEY] } : item;

export const normalizeFieldsWithOptions = (fields, defaultOptionValueKey = VALUE_NAME_KEY) =>
  fields.map((field) => {
    if (!field.definedValues || !field.definedValues.length) {
      return field;
    }
    const definedValues = field.definedValues.map(normalizeDefinedValue);
    let value = field.value;
    if (!value || !value.length) {
      value = [definedValues[0][defaultOptionValueKey]];
    }
    return { ...field, definedValues, value };
  });

export const mergeFields = (savedFields, fetchedFields) =>
  fetchedFields.map((field) => {
    const savedField = savedFields.find((item) => item.id === field.id);
    return savedField ? { ...field, ...savedField } : field;
  });

export const mapFieldsToValues = (fields, predefinedFieldValue, predefinedFieldKey) => {
  const valuesMap = {};
  fields.forEach((field) => {
    valuesMap[field.id] = field.value;
    if (field.fieldType === predefinedFieldKey && predefinedFieldValue) {
      valuesMap[field.id] = [predefinedFieldValue];
    }
  });
  return valuesMap;
};

export const getFieldComponent = (field) => {
  let fieldType = null;
  if (field.fieldType === ARRAY_TYPE && field.definedValues && field.definedValues.length) {
    fieldType = ARRAY_TYPE;
  } else if (field.fieldType === DATE_TYPE || field.fieldType.toLowerCase() === 'datetime') {
    fieldType = DATE_TYPE;
  } else if (field.definedValues && field.definedValues.length && field.fieldType !== ARRAY_TYPE) {
    fieldType = DROPDOWN_TYPE;
  } else {
    fieldType = TEXT_TYPE;
  }

  return FIELDS_MAP[fieldType];
};
