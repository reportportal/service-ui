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

export const getNewActiveAttributes = (key, value, activeAttributes) => {
  const activeAttribute = {
    key,
    value,
  };
  const activeAttributeIndex =
    activeAttributes && activeAttributes.findIndex((item) => item.key === key);

  if (activeAttributeIndex !== -1) {
    return activeAttributes.slice(0, activeAttributeIndex);
  }

  return [...activeAttributes, activeAttribute];
};

export const getBreadcrumbs = (attributeKeys, activeBreadcrumbId) =>
  attributeKeys.map((item, index) => ({
    id: index,
    key: item,
    isStatic: true,
    isActive: activeBreadcrumbId === index,
    additionalProperties: {
      color: null,
      value: null,
      passingRate: null,
    },
  }));

export const getNewActiveBreadcrumbs = (
  id,
  activeBreadcrumbs,
  activeBreadcrumbId,
  attributes,
  additionalProperties,
) => {
  const actualBreadcrumbs = activeBreadcrumbs || getBreadcrumbs(attributes, activeBreadcrumbId);

  return (
    actualBreadcrumbs &&
    actualBreadcrumbs.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isStatic: true,
          isActive: true,
          additionalProperties: null,
        };
      }

      if (additionalProperties && item.id === id - 1) {
        return {
          ...item,
          isStatic: false,
          isActive: false,
          additionalProperties,
        };
      }

      if (!additionalProperties && item.id > id) {
        return {
          ...item,
          isStatic: true,
          isActive: false,
          additionalProperties: null,
        };
      }

      return item;
    })
  );
};
