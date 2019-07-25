export const getAttributeValue = ({ key, value } = {}) => value || key;

export const formatAttribute = ({ key, value } = {}) => {
  if (key && value) {
    return `${key}:${value}`;
  }
  return getAttributeValue({ key, value }) || '';
};

export const systemAttributePredicate = ({ system } = {}) => !!system;

export const notSystemAttributePredicate = (attribute) => !systemAttributePredicate(attribute);

export const compareAttributes = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return a.key === b.key && a.value === b.value && a.system === b.system;
};

export const getUniqueAndCommonAttributes = (items) => {
  const flatAttributes = (result, item) => [...result, ...item.attributes];
  const uniqueAttributes = (attribute, index, attributes) =>
    index ===
    attributes.findIndex((attr) => attr.key === attribute.key && attr.value === attribute.value);
  const groupAttributes = (result, attribute) => {
    const eachItemContainsThatAttribute =
      items
        .reduce(flatAttributes, [])
        .filter((attr) => attr.key === attribute.key && attr.value === attribute.value).length ===
      items.length;
    const type = eachItemContainsThatAttribute ? 'common' : 'unique';

    return {
      ...result,
      [type]: [...result[type], attribute],
    };
  };

  return items
    .reduce(flatAttributes, [])
    .filter(uniqueAttributes)
    .reduce(groupAttributes, {
      common: [],
      unique: [],
    });
};
