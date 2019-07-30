import { TextField, DropdownField, DateField, ArrayField } from './fields';

export const TEXT_TYPE = 'text';
export const ARRAY_TYPE = 'array';
export const DROPDOWN_TYPE = 'dropdown';
export const DATE_TYPE = 'date';

export const FIELDS_MAP = {
  [TEXT_TYPE]: TextField,
  [DROPDOWN_TYPE]: DropdownField,
  [DATE_TYPE]: DateField,
  [ARRAY_TYPE]: ArrayField,
};

export const VALUE_NAME_KEY = 'valueName';
export const VALUE_ID_KEY = 'valueId';
