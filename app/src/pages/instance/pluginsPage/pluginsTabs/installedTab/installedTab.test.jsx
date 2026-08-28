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

import { act } from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { BTS_GROUP_TYPE, ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
import { MARKETPLACE_CATALOGUE_STATE } from 'controllers/plugins';
import { FETCH_MARKETPLACE_CATALOGUE } from 'controllers/plugins/constants';
import { PluginsCatalog } from '../../pluginsCatalog';
import { PluginsFilter } from '../../pluginsFilter';
import { InstalledTab } from './installedTab';

const marketplaceState = (overrides = {}) => ({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
  registry: { status: 'ONLINE', host: 'registry.reportportal.io' },
  installed: [],
  available: [],
  error: null,
  installing: [],
  query: { q: null, category: null },
  ...overrides,
});

const render = (marketplace = marketplaceState()) => {
  const dispatched = [];
  const store = createStore((state = { plugins: { marketplace } }, action) => {
    dispatched.push(action);
    return state;
  });
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <InstalledTab filterItems={[BTS_GROUP_TYPE]} plugins={[]} />
      </IntlProvider>
    </Provider>,
  );

  const call = (component, prop, ...args) => {
    act(() => {
      wrapper.find(component).first().prop(prop)(...args);
    });
    wrapper.update();
  };
  const lastRequest = () =>
    dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE).pop()?.payload;
  const requestCount = () =>
    dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE).length;

  return { wrapper, call, lastRequest, requestCount };
};

describe('InstalledTab', () => {
  // jestsetup turns every console.error into a throw, so React's notices about components this
  // page already had — and react-popper's update after the test ends — are filtered out here
  const consoleError = console.error;
  const reactNoise =
    /findDOMNode is deprecated|Support for defaultProps will be removed|for a non-boolean attribute/;
  const popperAct = (message, rest) =>
    message.includes('was not wrapped in act') && rest.some((arg) => /Popper/.test(String(arg)));

  beforeAll(() => {
    console.error = (message, ...rest) => {
      if (typeof message === 'string' && (reactNoise.test(message) || popperAct(message, rest))) {
        return;
      }
      consoleError(message, ...rest);
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  test('asks the server for the catalogue on mount', () => {
    const { requestCount } = render();

    expect(requestCount()).toBe(1);
  });

  test('sends the query to the server, debounced, instead of filtering one fetch locally', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', 'jir');

    expect(lastRequest()).toEqual({ q: 'jir', category: null, debounced: true });
  });

  test('a blank query asks for the whole catalogue again', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', '   ');

    expect(lastRequest()).toEqual({ q: null, category: null, debounced: true });
  });

  test('sends the category chip to the server without waiting, keeping the query on screen', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', 'jir');
    call(PluginsFilter, 'onFilterChange', BTS_GROUP_TYPE);

    expect(lastRequest()).toEqual({ q: 'jir', category: BTS_GROUP_TYPE, debounced: undefined });
  });

  test('the synthetic All and Installed chips are not sent as categories', () => {
    const { call, lastRequest } = render();

    call(PluginsFilter, 'onFilterChange', INSTALLED_GROUP_TYPE);
    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });

    call(PluginsFilter, 'onFilterChange', ALL_GROUP_TYPE);
    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });
  });

  test('a failed catalogue reaches the screen, and its retry asks again', () => {
    const { wrapper, call, lastRequest } = render(
      marketplaceState({
        catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED,
        error: 'Network Error',
      }),
    );
    const catalogue = wrapper.find(PluginsCatalog).first();

    expect(catalogue.prop('failed')).toBe(true);
    expect(catalogue.prop('offline')).toBe(false);

    call(PluginsCatalog, 'onRetry');

    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });
  });
});
