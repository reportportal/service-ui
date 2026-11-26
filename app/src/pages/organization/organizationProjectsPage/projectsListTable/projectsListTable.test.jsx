/*!
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

import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { prepareActiveOrganizationProjectsAction } from 'controllers/organization';
import { ProjectsListTable } from './projectsListTable';

jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: () => {} }) }));
jest.mock('@reportportal/ui-kit', () => ({ Table: () => null }));
jest.mock('components/main/paginationWrapper', () => ({
  PaginationWrapper: ({ children }) => children,
}));
jest.mock(
  'pages/organization/organizationProjectsPage/projectsListTable/projectActionMenu',
  () => ({ ProjectActionMenu: () => null }),
);

describe('ProjectsListTable', () => {
  test('reloads the projects of the active organization when sorted', () => {
    const actions = [];
    const state = {
      organizations: { organization: { activeOrganization: { id: 1, slug: 'org' } } },
    };
    const store = createStore((currentState, action) => {
      actions.push(action);
      return state;
    });
    const onChangeSorting = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <IntlProvider locale="en" onError={() => {}}>
          <ProjectsListTable
            itemCount={0}
            pageCount={0}
            onChangePage={() => {}}
            onChangePageSize={() => {}}
            onChangeSorting={onChangeSorting}
          />
        </IntlProvider>
      </Provider>,
    );

    wrapper.find('Table').prop('onChangeSorting')({ key: 'name' });

    expect(onChangeSorting).toHaveBeenCalledWith('name');
    expect(actions).toContainEqual(
      prepareActiveOrganizationProjectsAction({ organizationSlug: 'org' }),
    );
  });
});
