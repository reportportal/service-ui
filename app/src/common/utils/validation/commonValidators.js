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

import * as validate from './validate';
import { bindMessageToValidator, composeBoundValidators } from './validatorHelpers';

export const requiredField = bindMessageToValidator(validate.required, 'requiredFieldHint');

export const attributeKey = bindMessageToValidator(validate.attributeKey, 'attributeKeyLengthHint');

export const uniqueAttributeKey = (attributes) =>
  bindMessageToValidator(validate.uniqueAttributeKey(attributes), 'uniqueAttributeKeyHint');

export const filterName = bindMessageToValidator(validate.filterName, 'filterNameError');

export const itemNameEntity = bindMessageToValidator(validate.itemNameEntity, 'itemNameEntityHint');
export const launchNumericEntity = bindMessageToValidator(
  validate.launchNumericEntity,
  'launchNumericEntityHint',
);
export const descriptionEntity = bindMessageToValidator(
  validate.descriptionEntity,
  'descriptionEntityHint',
);

export const btsUrl = bindMessageToValidator(validate.url, 'btsUrlHint');
export const btsIntegrationName = bindMessageToValidator(
  validate.btsIntegrationName,
  'btsIntegrationNameHint',
);
export const btsProject = bindMessageToValidator(validate.btsProject, 'btsProjectHint');

export const email = bindMessageToValidator(validate.requiredEmail, 'emailHint');
export const login = bindMessageToValidator(validate.login, 'loginHint');
export const password = bindMessageToValidator(validate.password, 'passwordHint');
export const userName = bindMessageToValidator(validate.userName, 'nameHint');

export const createPatternNameValidator = (patterns, patternId) =>
  composeBoundValidators([
    bindMessageToValidator(validate.patternNameLength, 'patternNameLengthHint'),
    bindMessageToValidator(
      validate.createPatternNameUniqueValidator(patternId, patterns),
      'patternNameDuplicateHint',
    ),
  ]);

export const createNumberOfLaunchesValidator = (message) =>
  bindMessageToValidator(validate.widgetNumberOfLaunches, message);
export const createWidgetContentFieldsValidator = (message) =>
  bindMessageToValidator(validate.isNotEmptyArray, message);
