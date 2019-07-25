export const getDefectFormFields = (fields, checkedFieldsIds, values) =>
  fields
    .filter((item) => item.required || checkedFieldsIds[item.id])
    .map((item) => ({ ...item, value: values[item.id] }));
