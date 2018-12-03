export const getAttributeValue = ({ key, value } = {}) => value || key;

export const formatAttribute = ({ key, value } = {}) => {
  if (key && value) {
    return `${key}:${value}`;
  }
  return getAttributeValue({ key, value }) || '';
};

export const systemAttributePredicate = ({ system } = {}) => !!system;

export const notSystemAttributePredicate = (attribute) => !systemAttributePredicate(attribute);
