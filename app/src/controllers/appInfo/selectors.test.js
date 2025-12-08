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

import { tmsEnabledSelector } from './selectors';
import { TMS_ENABLED_KEY } from './constants';

describe('appInfo/selectors', () => {
  describe('tmsEnabledSelector', () => {
    test('should return true when TMS_ENABLED_KEY is set to "true"', () => {
      const state = {
        appInfo: {
          api: {
            environment: {
              [TMS_ENABLED_KEY]: 'true',
            },
          },
        },
      };
      expect(tmsEnabledSelector(state)).toBe(true);
    });

    test('should return false when TMS_ENABLED_KEY is set to "false"', () => {
      const state = {
        appInfo: {
          api: {
            environment: {
              [TMS_ENABLED_KEY]: 'false',
            },
          },
        },
      };
      expect(tmsEnabledSelector(state)).toBe(false);
    });

    test('should return false when TMS_ENABLED_KEY is not set', () => {
      const state = {
        appInfo: {
          api: {
            environment: {},
          },
        },
      };
      expect(tmsEnabledSelector(state)).toBe(false);
    });

    test('should return false when environment is not set', () => {
      const state = {
        appInfo: {
          api: {},
        },
      };
      expect(tmsEnabledSelector(state)).toBe(false);
    });

    test('should return false when api is not set', () => {
      const state = {
        appInfo: {},
      };
      expect(tmsEnabledSelector(state)).toBe(false);
    });

    test('should return false when appInfo is not set', () => {
      const state = {};
      expect(tmsEnabledSelector(state)).toBe(false);
    });
  });
});
