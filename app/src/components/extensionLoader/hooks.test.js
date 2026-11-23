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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { useFederatedComponent } from './hooks';

jest.mock('./loadComponent', () => ({
  loadComponent: jest.fn(() => () => Promise.resolve({ default: () => null })),
}));

const SCOPE = 'loadedScope';

const VALID_URL = 'https://plugins.example.com/remoteEntity.js';

const HookProbe = ({ url }) => {
  const { failed, Component } = useFederatedComponent(SCOPE, './module', url);

  return <div data-failed={failed} data-has-component={!!Component} />;
};
HookProbe.propTypes = {
  url: PropTypes.string,
};
HookProbe.defaultProps = {
  url: null,
};

const probeProps = (wrapper) => wrapper.update().find('div').props();

const renderHook = (url) => probeProps(mount(<HookProbe url={url} />));

describe('useFederatedComponent with an already loaded scope', () => {
  beforeEach(() => {
    window[SCOPE] = {};
  });

  afterEach(() => {
    delete window[SCOPE];
  });

  test('reports a failure and renders nothing for an invalid URL', () => {
    const props = renderHook(null);

    expect(props['data-failed']).toBe(true);
    expect(props['data-has-component']).toBe(false);
  });

  test('loads the registered module for a valid URL', () => {
    const props = renderHook(VALID_URL);

    expect(props['data-failed']).toBe(false);
    expect(props['data-has-component']).toBe(true);
  });

  test('clears the failure when an invalid URL is replaced by a valid one', () => {
    const wrapper = mount(<HookProbe url={null} />);
    wrapper.setProps({ url: VALID_URL });
    const props = probeProps(wrapper);

    expect(props['data-failed']).toBe(false);
    expect(props['data-has-component']).toBe(true);
  });
});
