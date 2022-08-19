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

export const MAX_DEFECT_TYPES_COUNT = 74;

export const NAME_FIELD_KEY = 'longName';
export const GROUP_FIELD_KEY = 'typeRef';
export const COLOR_FIELD_KEY = 'color';
export const ABBREVIATION_FIELD_KEY = 'shortName';

export const GROUP_CASES = {
  PRODUCT_BUG: 'product_bug',
  AUTOMATION_BUG: 'automation_bug',
  SYSTEM_ISSUE: 'system_issue',
  NO_DEFECT: 'no_defect',
  TO_INVESTIGATE: 'to_investigate',
};

export const DEFAULT_DEFECT_CONFIG = {
  [NAME_FIELD_KEY]: '',
  [GROUP_FIELD_KEY]: GROUP_CASES.PRODUCT_BUG,
  [COLOR_FIELD_KEY]: '#d32f2f',
  [ABBREVIATION_FIELD_KEY]: '',
};
