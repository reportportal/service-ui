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

import {
  validate as commonValidate,
  commonValidators,
  bindMessageToValidator,
} from 'common/utils/validation';
import { getSessionItem } from 'common/utils/storageUtils';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_COMMENTS_KEY,
  INCLUDE_LOGS_KEY,
  REQUIRED_KEY,
} from './constants';

const validateNonRequiredField = (value, type, hint) => {
  const fieldValue = value && value[0];
  let isFieldValid = true;
  if (fieldValue) {
    try {
      const parsedFieldValue = JSON.parse(fieldValue);
      // eslint-disable-next-line
      isFieldValid = typeof parsedFieldValue === type;
      // eslint-disable-next-line no-empty
    } catch (e) {
      isFieldValid = false;
    }
  }
  return isFieldValid ? undefined : hint;
};

const validateDoubleField = (value) => validateNonRequiredField(value, 'number', 'doubleFieldHint');

const validateBooleanField = (value) =>
  validateNonRequiredField(value, 'boolean', 'booleanFieldHint');

const FIELDS_VALIDATION_MAP = {
  boolean: validateBooleanField,
  double: validateDoubleField,
  [REQUIRED_KEY]: bindMessageToValidator(commonValidate.isNotEmptyArray, 'requiredFieldHint'),
};

export const validate = (fields, validationConfig) => {
  let validValues = {
    username: commonValidators.requiredField(fields.username),
    password: commonValidators.requiredField(fields.password),
    token: commonValidators.requiredField(fields.token),
  };
  if (validationConfig) {
    const validatedFields = Object.keys(validationConfig).reduce((acc, key) => {
      const validateField = validationConfig[key];
      return validateField ? { ...acc, [key]: validateField(fields[key]) } : acc;
    }, {});

    validValues = Object.assign(validValues, validatedFields);
  }
  return validValues;
};

export const createFieldsValidationConfig = (fields) =>
  fields.reduce((acc, item) => {
    const itemValidationKey = item.required ? REQUIRED_KEY : item.fieldType;
    return { ...acc, [item.id]: FIELDS_VALIDATION_MAP[itemValidationKey] };
  }, {});

export const getDataSectionConfig = (value) => ({
  [INCLUDE_ATTACHMENTS_KEY]: value,
  [INCLUDE_LOGS_KEY]: value,
  [INCLUDE_COMMENTS_KEY]: value,
});

export const getDefaultIssueModalConfig = (namedIntegrations, userId) => {
  const { pluginName = Object.keys(namedIntegrations)[0], integrationId, ...config } =
    getSessionItem(`${userId}_settings`) || {};

  const integration =
    namedIntegrations[pluginName].find((item) => item.id === integrationId) ||
    namedIntegrations[pluginName][0] ||
    {};

  return {
    ...config,
    integration,
    pluginName,
  };
};
