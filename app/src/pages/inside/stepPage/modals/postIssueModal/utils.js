export const validate = (fields, validationConfig) => {
  let validValues = {
    username:
      !fields.username && typeof fields.username === 'string' ? 'requiredFieldHint' : undefined,
    password:
      !fields.password && typeof fields.password === 'string' ? 'requiredFieldHint' : undefined,
    accessKey:
      !fields.accessKey && typeof fields.accessKey === 'string' ? 'requiredFieldHint' : undefined,
  };
  if (validationConfig) {
    const validatedFields = {};
    Object.keys(validationConfig).map((key) => {
      if (validationConfig[key]) {
        validatedFields[key] = !fields[key] || !fields[key][0] ? 'requiredFieldHint' : undefined;
      }
      return null;
    });

    validValues = Object.assign(validValues, validatedFields);
  }
  return validValues;
};

export const createFieldsValidationConfig = (fields) =>
  fields.reduce((acc, item) => ({ ...acc, [item.id]: item.required }), {});

export function getSessionStorageItem(key) {
  return sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : null;
}
export function setSessionStorageItem(key, value) {
  return sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionStorageItem(key) {
  sessionStorage.removeItem(key);
}
