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
      value = definedValues[0].valueId;
    }
    return { ...field, definedValues, value };
  });
