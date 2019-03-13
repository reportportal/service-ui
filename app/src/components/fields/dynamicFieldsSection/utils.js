import { ARRAY_TYPE, DROPDOWN_TYPE, DATE_TYPE, TEXT_TYPE, FIELDS_MAP } from './constants';

const normalizeDefinedValue = (item) =>
  !item.valueId ? { ...item, valueId: item.valueName } : item;

export const normalizeFieldsWithOptions = (fields) =>
  fields.map((field) => {
    if (!field.definedValues || !field.definedValues.length) {
      return field;
    }
    const definedValues = field.definedValues.map(normalizeDefinedValue);
    let value = field.value;
    if (!value || !value.length) {
      value = [definedValues[0].valueId];
    }
    return { ...field, definedValues, value };
  });

export const mergeFields = (savedFields, fetchedFields) => {
  const updatedFields = [...fetchedFields];
  savedFields.forEach((field) => {
    const currentFieldIndexFromProps = updatedFields.findIndex((item) => item.id === field.id);
    if (currentFieldIndexFromProps !== -1) {
      updatedFields[currentFieldIndexFromProps] = {
        ...updatedFields[currentFieldIndexFromProps],
        ...field,
      };
    }
  });

  return updatedFields;
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
