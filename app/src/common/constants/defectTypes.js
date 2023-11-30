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

export const PRODUCT_BUG = 'product_bug';
export const AUTOMATION_BUG = 'automation_bug';
export const SYSTEM_ISSUE = 'system_issue';
export const NO_DEFECT = 'no_defect';
export const TO_INVESTIGATE = 'to_investigate';

export const DEFECT_TYPES_SEQUENCE = [
  PRODUCT_BUG.toUpperCase(),
  AUTOMATION_BUG.toUpperCase(),
  SYSTEM_ISSUE.toUpperCase(),
  NO_DEFECT.toUpperCase(),
  TO_INVESTIGATE.toUpperCase(),
];

export const DEFECT_TYPES_MAP = {
  PRODUCT_BUG: PRODUCT_BUG.toUpperCase(),
  AUTOMATION_BUG: AUTOMATION_BUG.toUpperCase(),
  SYSTEM_ISSUE: SYSTEM_ISSUE.toUpperCase(),
  NO_DEFECT: NO_DEFECT.toUpperCase(),
  TO_INVESTIGATE: TO_INVESTIGATE.toUpperCase(),
};

export const DEFECT_TYPES_LOCATORS_TO_DEFECT_TYPES = {
  ab001: AUTOMATION_BUG,
  pb001: PRODUCT_BUG,
  si001: SYSTEM_ISSUE,
  ti001: TO_INVESTIGATE,
  nd001: NO_DEFECT,
};

export const TO_INVESTIGATE_LOCATOR_PREFIX = 'ti';

export const DEFAULT_DEFECT_TYPES_LOCATORS = ['ab001', 'pb001', 'si001', 'ti001', 'nd001'];
