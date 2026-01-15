/*
 * Copyright 2025 EPAM Systems
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

import { validate, bindMessageToValidator, composeBoundValidators } from 'common/utils/validation';
import {
  composeValidators,
  lengthRange,
  regex,
  range,
} from 'common/utils/validation/validatorHelpers';
import { NAME_FIELD_KEY, LEVEL_FIELD_KEY, MIN_LOG_LEVEL, MAX_LOG_LEVEL } from './constants';

export const logTypeName = composeValidators([lengthRange(3, 16), regex(/^[A-Za-z0-9_-]+$/)]);
export const logTypeLevel = composeValidators([
  range(MIN_LOG_LEVEL, MAX_LOG_LEVEL),
  regex(/^\d+$/),
]);

export const nameUniqueValidator = (logTypes, excludeLogTypeId = null) => (value) =>
  !logTypes?.some(
    (type) =>
      type.name.toLowerCase() === value.toLowerCase() &&
      (!excludeLogTypeId || type.id !== excludeLogTypeId),
  );

export const levelUniqueValidator = (logTypes, excludeLogTypeId = null) => (value) =>
  !logTypes?.some(
    (type) => type.level === Number(value) && (!excludeLogTypeId || type.id !== excludeLogTypeId),
  );

export const logTypeValidator = (logTypes = [], excludeLogTypeId = null) => (values) => {
  const { [NAME_FIELD_KEY]: name, [LEVEL_FIELD_KEY]: level } = values;

  return {
    [NAME_FIELD_KEY]: composeBoundValidators([
      bindMessageToValidator(validate.required, 'requiredFieldHint'),
      bindMessageToValidator(logTypeName, 'logTypeNameInvalidHint'),
      bindMessageToValidator(
        nameUniqueValidator(logTypes, excludeLogTypeId),
        'logTypeNameAlreadyExistsHint',
      ),
    ])(name),

    [LEVEL_FIELD_KEY]: composeBoundValidators([
      bindMessageToValidator(validate.required, 'requiredFieldHint'),
      bindMessageToValidator(logTypeLevel, 'logTypeLevelInvalidHint'),
      bindMessageToValidator(
        levelUniqueValidator(logTypes, excludeLogTypeId),
        'logTypeLevelAlreadyExistsHint',
      ),
    ])(level),
  };
};
