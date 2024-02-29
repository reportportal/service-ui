/*
 * Copyright 2023 EPAM Systems
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
  ARROW_DOWN_KEY_CODE,
  ENTER_KEY_CODE,
  ESCAPE_KEY_CODE,
  SPACE_KEY_CODE,
  TAB_KEY_CODE,
} from 'common/constants/keyCodes';

export const OPEN_DROPDOWN_KEY_CODES_MAP = {
  [ENTER_KEY_CODE]: 'ENTER',
  [SPACE_KEY_CODE]: 'SPACE',
  [ARROW_DOWN_KEY_CODE]: 'ARROW_DOWN',
};

export const CLOSE_DROPDOWN_KEY_CODES_MAP = {
  [ESCAPE_KEY_CODE]: 'ESCAPE',
  [TAB_KEY_CODE]: 'TAB',
};

export const EVENT_NAME = {
  ON_KEY_DOWN: 'onKeyDown',
  ON_CLICK: 'onClick',
};
