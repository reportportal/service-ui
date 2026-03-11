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

import { omit } from 'common/utils/omit';
import { JIRA_CLOUD } from 'pages/inside/projectSettingsPageContainer/content/integrations/integrationsList/integrationInfo/constats';
import {
  ARRAY_TYPE,
  DROPDOWN_TYPE,
  DATE_TYPE,
  TEXT_TYPE,
  VALUE_ID_KEY,
  VALUE_NAME_KEY,
  AUTOCOMPLETE_TYPE,
  MULTIPLE_AUTOCOMPLETE_TYPE,
  CREATABLE_MULTIPLE_AUTOCOMPLETE_TYPE,
  MULTILINE_TEXT_TYPE,
  VALUE_NONE,
  ASSIGNEE_FIELD_NAME,
} from './constants';
import { FIELDS_MAP } from './dynamicFieldMap';

const AUTOCOMPLETE_TYPES = [
  AUTOCOMPLETE_TYPE,
  MULTIPLE_AUTOCOMPLETE_TYPE,
  CREATABLE_MULTIPLE_AUTOCOMPLETE_TYPE,
];

const normalizeDefinedValue = (item) =>
  !item[VALUE_ID_KEY] ? { ...item, [VALUE_ID_KEY]: item[VALUE_NAME_KEY] } : item;

export const normalizeFieldsWithOptions = (fields, defaultOptionValueKey = VALUE_NAME_KEY) =>
  fields.map((field) => {
    if (!field?.definedValues?.length) {
      return field;
    }
    const isNoneValueExist = field.definedValues.some(
      (item) => item[VALUE_NAME_KEY] === VALUE_NONE,
    );
    if (!field.required && field.fieldType !== ARRAY_TYPE && !isNoneValueExist) {
      field.definedValues.unshift({ [VALUE_NAME_KEY]: VALUE_NONE });
    }
    const definedValues = field.definedValues.map(normalizeDefinedValue);
    let value = field.value;
    if (!value?.length && field.fieldType !== ARRAY_TYPE) {
      value = [definedValues[0][defaultOptionValueKey]];
    }
    return { ...field, definedValues, value };
  });

export const mergeFields = (savedFields, fetchedFields) =>
  fetchedFields.map((field) => {
    const savedField = savedFields.find((item) => item.id === field.id);
    return savedField ? { ...field, ...omit(savedField, ['definedValues']) } : field;
  });

export const mapFieldsToValues = (fields, predefinedFieldValue, predefinedFieldKey) => {
  const valuesMap = {};
  fields.forEach((field) => {
    const isAutocomplete =
      field.fieldType === AUTOCOMPLETE_TYPE ||
      field.fieldType === MULTIPLE_AUTOCOMPLETE_TYPE ||
      field.fieldType === CREATABLE_MULTIPLE_AUTOCOMPLETE_TYPE;
    valuesMap[field.id] = isAutocomplete ? field.namedValue : field.value;
    if (field.fieldType === predefinedFieldKey && predefinedFieldValue) {
      valuesMap[field.id] = [predefinedFieldValue];
    }
  });
  return valuesMap;
};

export const getFieldComponent = (field) => {
  let fieldType = TEXT_TYPE;

  if (field.fieldType === MULTILINE_TEXT_TYPE) {
    fieldType = MULTILINE_TEXT_TYPE;
  } else if (field.fieldType === ARRAY_TYPE) {
    fieldType = ARRAY_TYPE;
  } else if (field.fieldType === DATE_TYPE || field.fieldType.toLowerCase() === 'datetime') {
    fieldType = DATE_TYPE;
  } else if (field.definedValues?.length && field.fieldType !== ARRAY_TYPE) {
    fieldType = DROPDOWN_TYPE;
  } else if (field.commandName && AUTOCOMPLETE_TYPES.includes(field.fieldType)) {
    fieldType = field.fieldType;
  }

  return FIELDS_MAP[fieldType];
};

export const removeNoneValues = (inputObj) => {
  const obj = { ...inputObj };
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].filter((item) => item !== VALUE_NONE);
    }
  });
  return obj;
};

export const isJiraCloudAssigneeField = (pluginName, field) => {
  const isJiraCloud = pluginName === JIRA_CLOUD;
  const isAssigneeField = field.fieldName?.toLowerCase() === ASSIGNEE_FIELD_NAME.toLowerCase();
  return isJiraCloud && isAssigneeField;
};
