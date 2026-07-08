/*
 * Copyright 2026 EPAM Systems
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

import localeUK from '../../../localization/translated/uk.json';
import localeRU from '../../../localization/translated/ru.json';
import localeBE from '../../../localization/translated/be.json';
import localeZH from '../../../localization/translated/zh.json';
import localeES from '../../../localization/translated/es.json';

// Core (host) message catalog per language. `en` is intentionally absent:
// English is covered by `defaultMessage` in `defineMessages`.
export const CORE_MESSAGES = {
  ru: localeRU,
  be: localeBE,
  uk: localeUK,
  zh: localeZH,
  es: localeES,
};
