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
  composeValidators,
  isEmpty,
  isNotEmpty,
  minLength,
  maxLength,
  regex,
  lengthRange,
  range,
  isNotOnlySpaces,
} from './validatorHelpers';

export const required = isNotEmpty;
export const isNotEmptyArray = composeValidators([isNotEmpty, minLength(1)]);
export const url = composeValidators([isNotEmpty, regex(/^(ftp|http|https):\/\/[^ "]+$/)]);
export const email = composeValidators([regex(/^[a-z0-9.+_-]+@[a-z0-9_.-]+?\.[a-z0-9]{2,}$/i)]);
export const requiredEmail = composeValidators([isNotEmpty, email]);
export const login = composeValidators([isNotEmpty, regex(/^[0-9a-zA-Z-_.]{1,128}$/)]);
export const password = composeValidators([isNotEmpty, regex(/^(.){4,256}$/)]);
export const userName = composeValidators([
  isNotEmpty,
  regex(/^[a-z0-9._\-\s\u0400-\u04FF]{3,256}$/i),
]);
export const filterName = composeValidators([isNotEmpty, lengthRange(3, 128)]);
export const launchName = composeValidators([isNotEmpty, maxLength(256)]);
export const launchDescription = maxLength(1024);
export const dashboardName = composeValidators([isNotEmpty, lengthRange(3, 128)]);
export const createDashboardNameUniqueValidator = (dashboardItems, dashboardItem) => (name) =>
  !dashboardItems.some((dashboard) => dashboard.name === name && dashboard.id !== dashboardItem.id);
export const widgetName = composeValidators([isNotEmpty, lengthRange(3, 128)]);
export const createWidgetNameUniqueValidator = (widgets, widgetId) => (value) =>
  !widgets.some((widget) => widget.widgetName === value && widget.widgetId !== widgetId);
export const issueId = composeValidators([isNotEmpty, maxLength(128)]);
export const ldapUrl = composeValidators([isNotEmpty, regex(/:\/\/.+/)]);
export const defectTypeLongName = composeValidators([isNotEmpty, lengthRange(3, 55)]);
export const defectTypeShortName = composeValidators([isNotEmpty, maxLength(4)]);
export const projectName = composeValidators([isNotEmpty, regex(/^[0-9a-zA-Z-_]{3,256}$/)]);
export const btsIntegrationName = composeValidators([isNotEmpty, maxLength(55)]);
export const btsProject = composeValidators([isNotEmpty, maxLength(55)]);
export const patternNameLength = composeValidators([isNotEmpty, maxLength(55)]);
export const createPatternNameUniqueValidator = (patternId, patterns) => (newPatternName) =>
  !patterns.some(({ id, name: patternName }) => patternName === newPatternName && id !== patternId);
export const analyzerMinShouldMatch = composeValidators([
  isNotEmpty,
  regex(/^([5-9][0-9])$|^100$/i),
]);
export const itemNameEntity = composeValidators([
  isNotEmpty,
  ({ value }) => composeValidators([isNotEmpty, lengthRange(3, 256)])(value),
]);
export const launchNumericEntity = composeValidators([
  isNotEmpty,
  ({ value }) => composeValidators([isNotEmpty, maxLength(18), regex(/^[0-9]+$/)])(value),
]);
export const descriptionEntity = composeValidators([
  isNotEmpty,
  ({ value }) => composeValidators([isNotEmpty, maxLength(18)])(value),
]);

export const port = range(1, 65535);

export const searchFilter = (value) =>
  !value || composeValidators([isNotOnlySpaces, minLength(3)])(value);
export const searchMembers = (value) => !value || isNotOnlySpaces(value);
export const attributeKey = (value) =>
  !value || composeValidators([isNotOnlySpaces, maxLength(128)])(value);
export const uniqueAttributeKey = (attributes) => (value) =>
  attributes.filter((attribute) => attribute === value).length <= 1;
export const attributeValue = composeValidators([isNotEmpty, maxLength(128)]);
export const attributesArray = (value) =>
  isEmpty(value) ||
  !value.length ||
  value.every((attribute) => attributeValue(attribute.value) && !attribute.edited);

export const widgetNumberOfLaunches = composeValidators([isNotEmpty, range(1, 600)]);
export const cumulativeItemsValidation = composeValidators([isNotEmpty, range(1, 15)]);
export const healthCheckWidgetPassingRate = composeValidators([isNotEmpty, range(50, 100)]);
export const flakyWidgetNumberOfLaunches = composeValidators([isNotEmpty, range(2, 600)]);
export const launchesWidgetContentFields = composeValidators([isNotEmptyArray, minLength(4)]);
export const mostFailedWidgetNumberOfLaunches = composeValidators([isNotEmpty, range(2, 600)]);
export const createNotificationRecipientsValidator = (informOwner) => (value) =>
  isNotEmptyArray(value) || informOwner;
export const notificationLaunchNames = (value) =>
  isEmpty(value) || !value.length || value.every(launchName);
