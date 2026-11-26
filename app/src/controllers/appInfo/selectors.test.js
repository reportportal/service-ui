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

import {
  instanceTypeSelector,
  shouldShowExploreCloudPromoSelector,
  tmsEnabledSelector,
  apiBuildVersionSelector,
  authExtensionsSelector,
  analyticsEnabledSelector,
  instanceIdSelector,
  gaMeasurementIdSelector,
  passwordMinLengthSelector,
  isDemoInstanceSelector,
  flushDataInSelector,
  analyzerExtensionsSelector,
  isAnalyzerAvailableSelector,
  ssoUsersOnlySelector,
  sessionExpirationTimeSelector,
  serverSidebarLinksSelector,
  importantLaunchesEnabledSelector,
  personalOrganizationsSelector,
  isOldHistorySelector,
  allowDeleteAccountSelector,
} from './selectors';
import { EPAM, INSTANCE_TYPE, NOT_PROVIDED, SAAS, TMS_ENABLED_KEY } from './constants';

const getStateWithInstanceType = (instanceType) => ({
  appInfo: {
    api: {
      environment: {
        [INSTANCE_TYPE]: instanceType,
      },
    },
  },
});

describe('appInfo/selectors', () => {
  describe('instanceTypeSelector', () => {
    test('should return "SAAS" when instance type is set to "SAAS"', () => {
      expect(instanceTypeSelector(getStateWithInstanceType('SAAS'))).toBe(SAAS);
    });

    test('should not match SAAS constant when instance type is set to "SaaS"', () => {
      expect(instanceTypeSelector(getStateWithInstanceType('SaaS'))).not.toBe(SAAS);
    });

    test('should return EPAM when instance type is set to "EPAM"', () => {
      expect(instanceTypeSelector(getStateWithInstanceType('EPAM'))).toBe(EPAM);
    });

    test('should return NOT_PROVIDED when instance type is not set', () => {
      expect(instanceTypeSelector({ appInfo: { api: { environment: {} } } })).toBe(NOT_PROVIDED);
    });
  });

  describe('shouldShowExploreCloudPromoSelector', () => {
    test('should return false for "SAAS" instance type', () => {
      expect(shouldShowExploreCloudPromoSelector(getStateWithInstanceType('SAAS'))).toBe(false);
    });

    test('should return true when instance type is not provided', () => {
      expect(shouldShowExploreCloudPromoSelector({ appInfo: {} })).toBe(true);
    });
  });

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

  describe('with the anonymous (pre-login) payload of /info', () => {
    // what the API returns to a caller that is not signed in; everything else is absent
    const anonymousState = {
      appInfo: {
        api: {
          build: { name: 'API Service', version: '26.1.0' },
          authExtensions: { github: { button: '<span>GitHub</span>', path: '/oauth/login/github' } },
          extensions: {
            result: {
              'server.analytics.all': 'true',
              'server.details.instance': 'instance-id',
              'server.password.min.length': '12',
            },
          },
          environment: { ga_measurement_id: 'G-TEST', instance_type: 'SAAS' },
          jobs: { flushingDataTrigger: {} },
        },
        ui: {},
        jobs: {},
      },
    };

    test('pre-login selectors read their values', () => {
      expect(apiBuildVersionSelector(anonymousState)).toBe('26.1.0');
      expect(Object.keys(authExtensionsSelector(anonymousState))).toEqual(['github']);
      expect(analyticsEnabledSelector(anonymousState)).toBe(true);
      expect(instanceIdSelector(anonymousState)).toBe('instance-id');
      expect(gaMeasurementIdSelector(anonymousState)).toBe('G-TEST');
      expect(passwordMinLengthSelector(anonymousState)).toBe(12);
      expect(instanceTypeSelector(anonymousState)).toBe(SAAS);
      expect(isDemoInstanceSelector(anonymousState)).toBe(true);
    });

    test('post-login selectors fall back to defaults instead of failing', () => {
      expect(flushDataInSelector(anonymousState)).toBeNull();
      expect(analyzerExtensionsSelector(anonymousState)).toEqual([]);
      expect(isAnalyzerAvailableSelector(anonymousState)).toBe(false);
      expect(ssoUsersOnlySelector(anonymousState)).toBe(false);
      expect(sessionExpirationTimeSelector(anonymousState)).toBe(Infinity);
      expect(serverSidebarLinksSelector(anonymousState)).toEqual([]);
      expect(importantLaunchesEnabledSelector(anonymousState)).toBe(false);
      expect(personalOrganizationsSelector(anonymousState)).toBe(false);
      expect(isOldHistorySelector(anonymousState)).toBe(false);
      expect(allowDeleteAccountSelector(anonymousState)).toBe(false);
      expect(tmsEnabledSelector(anonymousState)).toBe(false);
    });
  });
});
