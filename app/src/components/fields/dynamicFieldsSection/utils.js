export const normalizeFieldsWithOptions = (fields) => {
  const updatedFields = [...fields];
  return updatedFields.map((field, index) => {
    if (field.definedValues && field.definedValues.length) {
      if (!field.definedValues[0].valueId) {
        field.definedValues.forEach((item, itemIndex) => {
          updatedFields[index].definedValues[itemIndex].valueId = item.valueName;
        });
      }
      if (!field.value || !field.value.length) {
        updatedFields[index].value = [field.definedValues[0].valueId];
      }
    }
    return field;
  });
};
