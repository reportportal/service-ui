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

import { redirect } from 'redux-first-router';
import {
  ORGANIZATIONS_ACTIVITY_PAGE,
  ORGANIZATIONS_PAGE,
  ORGANIZATION_SETTINGS_TAB_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
} from 'controllers/pages';
import { fetchProjectAction } from 'controllers/project';
import { prepareActiveOrganizationSettingsAction } from 'controllers/organization/actionCreators';
import { GENERAL, INTEGRATIONS } from 'common/constants/settingsTabs';
import routesMap from './routesMap';

// The page components behind pageRendering are not needed to run route thunks.
jest.mock('./constants', () => ({
  ANONYMOUS_ACCESS: 'anonymous',
  ADMIN_ACCESS: 'admin',
  pageRendering: {},
}));

const runThunk = (route, state) => {
  const dispatched = [];
  routesMap[route].thunk(
    (action) => dispatched.push(action),
    () => state,
  );
  return dispatched;
};

const settingsState = (settingsTab, { activeProjectKey, loadedProjectKey }) => ({
  location: { payload: { organizationSlug: 'org', projectSlug: 'demo', settingsTab } },
  user: { activeProjectKey },
  project: { info: loadedProjectKey ? { projectKey: loadedProjectKey } : {} },
});

describe('routesMap', () => {
  describe('PROJECT_SETTINGS_TAB_PAGE', () => {
    test('does not refetch an already loaded project or organization settings on a tab switch', () => {
      const state = settingsState(INTEGRATIONS, {
        activeProjectKey: 'DEMO',
        loadedProjectKey: 'DEMO',
      });
      expect(runThunk(PROJECT_SETTINGS_TAB_PAGE, state)).toEqual([]);
    });

    test('loads organization settings for the General tab and a project that is not loaded yet', () => {
      const state = settingsState(GENERAL, { activeProjectKey: 'DEMO', loadedProjectKey: 'OTHER' });
      expect(runThunk(PROJECT_SETTINGS_TAB_PAGE, state)).toEqual([
        prepareActiveOrganizationSettingsAction(state.location.payload),
        fetchProjectAction('DEMO', true),
      ]);
    });
  });

  describe('ORGANIZATION_SETTINGS_TAB_PAGE', () => {
    test('loads organization settings only for the General tab', () => {
      const general = settingsState(GENERAL, {});
      expect(runThunk(ORGANIZATION_SETTINGS_TAB_PAGE, general)).toEqual([
        prepareActiveOrganizationSettingsAction(general.location.payload),
      ]);
      expect(runThunk(ORGANIZATION_SETTINGS_TAB_PAGE, settingsState(INTEGRATIONS, {}))).toEqual([]);
    });
  });

  describe('ORGANIZATIONS_ACTIVITY_PAGE', () => {
    test('redirects a user without access to the organizations list', () => {
      const state = { user: { info: { userRole: 'USER' } }, location: { payload: {} } };
      expect(runThunk(ORGANIZATIONS_ACTIVITY_PAGE, state)).toEqual([
        redirect({ type: ORGANIZATIONS_PAGE }),
      ]);
    });
  });
});
