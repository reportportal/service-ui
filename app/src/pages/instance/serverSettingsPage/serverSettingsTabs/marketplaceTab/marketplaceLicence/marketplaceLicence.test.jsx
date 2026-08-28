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
import { IntlProvider } from 'react-intl';
import { MarketplaceLicence } from './marketplaceLicence';

const render = (props = {}) => {
  const wrapper = mount(
    <IntlProvider locale="en" onError={() => {}}>
      <MarketplaceLicence isAdmin {...props} />
    </IntlProvider>,
  );
  const find = (id) => wrapper.find(`[data-automation-id="${id}"]`);
  const call = (id, prop, ...args) => {
    act(() => {
      find(id).first().prop(prop)(...args);
    });
    wrapper.update();
  };
  const type = (id, value) => call(id, 'onChange', { target: { value } });
  const click = (id) => call(id, 'onClick');
  const valueOf = (id) => find(id).first().prop('value');

  return { wrapper, find, click, type, valueOf };
};

describe('MarketplaceLicence', () => {
  const consoleError = console.error;

  beforeAll(() => {
    console.error = (message, ...rest) => {
      if (
        typeof message === 'string' &&
        /findDOMNode is deprecated|Support for defaultProps will be removed/.test(message)
      ) {
        return;
      }
      consoleError(message, ...rest);
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  // the three endpoints are IS_ADMIN, so the section is absent rather than shown disabled
  test('is not rendered for anyone but an admin', () => {
    const { find } = render({ isAdmin: false });

    expect(find('marketplaceLicence')).toHaveLength(0);
  });

  test('says outright that nothing is configured, and what that costs', () => {
    const { find } = render();

    expect(find('licenceStatus').first().text()).toMatch(/premium plugins stay locked/i);
  });

  test('names the customer the stored credentials sign as', () => {
    const { find } = render({ configured: true, customerId: 'acme' });

    expect(find('licenceStatus').first().text()).toContain('acme');
  });

  // GET answers {configured, customerId}: there is no key to show and none is claimed
  test('the key field stays empty when credentials are configured', () => {
    const { valueOf } = render({ configured: true, customerId: 'acme' });

    expect(valueOf('licenceKeyField')).toBe('');
  });

  test('says explicitly that the stored key cannot be shown and how to replace it', () => {
    const { find } = render({ configured: true, customerId: 'acme' });

    expect(find('licenceKeyHint').first().text()).toMatch(/never shown again/i);
  });

  test('submitting sends the customer id and the key that was typed', () => {
    const onSubmit = jest.fn();
    const { type, click } = render({ onSubmit });

    type('customerIdField', 'acme');
    type('licenceKeyField', 'c2VjcmV0');
    click('submitLicence');

    expect(onSubmit).toHaveBeenCalledWith({ customerId: 'acme', privateKey: 'c2VjcmV0' });
  });

  test('the key does not outlive the request that carried it', () => {
    const { type, click, valueOf } = render();

    type('licenceKeyField', 'c2VjcmV0');
    click('submitLicence');

    expect(valueOf('licenceKeyField')).toBe('');
  });

  test('removal is offered only when there is something to remove', () => {
    expect(render().find('removeLicence')).toHaveLength(0);
    expect(render({ configured: true, customerId: 'acme' }).find('removeLicence')).not.toHaveLength(
      0,
    );
  });

  test('removal states the consequence before it happens', () => {
    const onRemove = jest.fn();
    const { click, find } = render({ configured: true, customerId: 'acme', onRemove });

    click('removeLicence');

    expect(find('removeLicenceConfirm').first().text()).toMatch(
      /locks every premium plugin again/i,
    );
    expect(onRemove).not.toHaveBeenCalled();
  });

  test('confirming the removal is what actually removes them', () => {
    const onRemove = jest.fn();
    const { click } = render({ configured: true, customerId: 'acme', onRemove });

    click('removeLicence');
    click('confirmRemoveLicence');

    expect(onRemove).toHaveBeenCalled();
  });

  test('backing out of the removal removes nothing', () => {
    const onRemove = jest.fn();
    const { click, find } = render({ configured: true, customerId: 'acme', onRemove });

    click('removeLicence');
    click('cancelRemoveLicence');

    expect(onRemove).not.toHaveBeenCalled();
    expect(find('removeLicenceConfirm')).toHaveLength(0);
  });
});
