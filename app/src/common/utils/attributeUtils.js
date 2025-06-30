/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const getAttributeValue = ({ key, value } = {}) => value || key;

export const attributeFormatter = ({ key, value } = {}, divider) => {
  if (key && !value) {
    return `${key}${divider}`;
  }
  if (key && value) {
    return `${key}${divider}${value}`;
  }
  return getAttributeValue({ key, value }) || '';
};

export const formatAttribute = (attribute) => {
  return attributeFormatter(attribute, ':');
};

export const formatAttributeWithSpacedDivider = (attribute) => {
  return attributeFormatter(attribute, ' : ');
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

  return items.reduce(flatAttributes, []).filter(uniqueAttributes).reduce(groupAttributes, {
    common: [],
    unique: [],
  });
};

export const parseQueryAttributes = ({ value }) => {
  if (!value) return [];
  const attributes = value.split(',').map((item) => {
    if (item.includes(':')) {
      if (item.indexOf(':') === item.length - 1) {
        return {
          key: item.slice(0, -1),
          value: '',
        };
      } else {
        const values = item.split(':');
        return {
          key: `${values[0]}`,
          value: values[1],
        };
      }
    } else {
      return {
        key: '',
        value: item,
      };
    }
  });
  return attributes;
};
