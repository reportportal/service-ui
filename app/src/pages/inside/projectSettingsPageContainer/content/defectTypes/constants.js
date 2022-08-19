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

export const COLORS = [
  '#E73F26',
  '#F29C3A',
  '#F9D449',
  '#FAFD54',
  '#BDFC51',
  '#42E733',
  '#72F6D6',
  '#4BAFF0',
  '#1042F5',
  '#B339F3',
  '#E93A8F',
  '#C13621',
  '#BC782B',
  '#C0A336',
  '#ADAF3A',
  '#89B63D',
  '#4FAF47',
  '#45A590',
  '#3B79A1',
  '#1635A1',
  '#8736B1',
  '#95235A',
  '#A5403C',
  '#855722',
  '#6C5C1C',
  '#5F6021',
  '#587526',
  '#2B5C27',
  '#215046',
  '#1F4660',
  '#212B50',
  '#401955',
  '#7A1245',
];
