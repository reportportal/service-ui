import * as validation from './validation';

export const requiredField = (value) =>
  validation.isEmpty(value) ? 'requiredFieldHint' : undefined;
