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

import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { createStore } from 'redux';
import { Grid } from 'components/main/grid';
import { LogsGrid } from './logsGrid';
import { LogsGridBody } from './virtual';

let mockVirtualizationEnabled = true;
jest.mock('./constants', () => ({
  get LOGS_VIRTUALIZATION_ENABLED() {
    return mockVirtualizationEnabled;
  },
}));
jest.mock('components/main/grid', () => ({ Grid: jest.fn(() => null) }));
jest.mock('controllers/user', () => ({
  ...jest.requireActual('controllers/user'),
  noLogsCollapsingSelector: () => false,
  logsSizeSelector: () => 'medium',
  logsColorizedBackgroundSelector: () => false,
}));
jest.mock('controllers/project', () => ({
  ...jest.requireActual('controllers/project'),
  logTypesSelector: () => [],
}));

const renderGrid = () => {
  Grid.mockClear();
  mount(
    <Provider store={createStore(() => ({}))}>
      <IntlProvider locale="en" onError={() => {}}>
        <LogsGrid logItems={[{ id: 1 }]} />
      </IntlProvider>
    </Provider>,
  );
  return Grid.mock.calls[Grid.mock.calls.length - 1][0];
};

describe('LogsGrid', () => {
  afterEach(() => {
    mockVirtualizationEnabled = true;
  });

  test('renders the rows with the flat logs body when the virtualisation is enabled', () => {
    const body = shallow(<div>{renderGrid().renderBody({ data: [] })}</div>);

    expect(body.find(LogsGridBody).exists()).toBe(true);
  });

  test('keeps the rows of the shared grid when the virtualisation is switched off', () => {
    mockVirtualizationEnabled = false;

    const gridProps = renderGrid();

    expect(gridProps.renderBody).toBeUndefined();
    expect(gridProps.nestedView).toBe(true);
  });
});
