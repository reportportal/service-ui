/*
 * Copyright 2022 EPAM Systems
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

import { OWNER } from 'common/constants/permissions';
import { EMAIL } from 'common/constants/pluginNames';

export const convertNotificationCaseForSubmission = (obj) => {
  const {
    id,
    ruleName,
    informOwner,
    recipients,
    sendCase,
    launchNames = [],
    attributes = [],
    enabled = true,
    attributesOperator,
    type,
    ruleDetails,
  } = obj;
  const dynamicField =
    type === EMAIL
      ? { recipients: informOwner ? [...recipients, OWNER] : recipients }
      : { ruleDetails };
  return {
    id,
    ruleName,
    ...dynamicField,
    sendCase,
    launchNames,
    attributes,
    enabled,
    attributesOperator,
    type,
  };
};

export const isInternalLink = (to) => {
  return typeof to === 'object' && to.type;
};

export const flatRule = (notification) => {
  return { ...notification, ...notification?.ruleDetails };
};
