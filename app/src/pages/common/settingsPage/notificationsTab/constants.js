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

export const LABEL_WIDTH = 140;

export const RECIPIENTS_FIELD_KEY = 'recipients';
export const INFORM_OWNER_FIELD_KEY = 'informOwner';
export const SEND_CASE_FIELD_KEY = 'sendCase';
export const LAUNCH_NAMES_FIELD_KEY = 'launchNames';
export const ATTRIBUTES_FIELD_KEY = 'attributes';
export const ENABLED_FIELD_KEY = 'enabled';

export const LAUNCH_CASES = {
  ALWAYS: 'always',
  MORE_10: 'more10',
  MORE_20: 'more20',
  MORE_50: 'more50',
  FAILED: 'failed',
  TO_INVESTIGATE: 'toInvestigate',
};

export const DEFAULT_CASE_CONFIG = {
  [RECIPIENTS_FIELD_KEY]: [],
  [INFORM_OWNER_FIELD_KEY]: true,
  [SEND_CASE_FIELD_KEY]: LAUNCH_CASES.ALWAYS,
  [LAUNCH_NAMES_FIELD_KEY]: [],
  [ATTRIBUTES_FIELD_KEY]: [],
  [ENABLED_FIELD_KEY]: true,
};
