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
import { prepareActiveOrganizationUsersAction } from 'controllers/organization/users';
import { OrganizationTeamListTable } from './organizationUsersListTable';

jest.mock('../../../common/users/membersListTable', () => ({ MembersListTable: () => null }));
jest.mock('./organizationUsersActionMenu', () => ({ OrganizationUsersActionMenu: () => null }));

describe('OrganizationTeamListTable', () => {
  test('reloads the users of the active organization when sorted', () => {
    const actions = [];
    const state = {
      user: { info: {} },
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
          <OrganizationTeamListTable
            itemCount={0}
            pageCount={0}
            onChangePage={() => {}}
            onChangePageSize={() => {}}
            onChangeSorting={onChangeSorting}
          />
        </IntlProvider>
      </Provider>,
    );

    wrapper.find('MembersListTable').prop('onTableSorting')({ key: 'fullName' });

    expect(onChangeSorting).toHaveBeenCalledWith('fullName');
    expect(actions).toContainEqual(
      prepareActiveOrganizationUsersAction({ organizationSlug: 'org' }),
    );
  });
});
