import { isEmptyValue } from 'common/utils';

export const stringToArray = (str = '', separator) => {
  if (isEmptyValue(str)) {
    return [];
  }
  return str.toString().split(separator);
};
