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

// the section is mounted through a host so a prop can arrive later, the way the GET answer does
const Host = (props) => (
  <IntlProvider locale="en" onError={() => {}}>
    <MarketplaceLicence isAdmin {...props} />
  </IntlProvider>
);

const render = (props = {}) => {
  const wrapper = mount(<Host {...props} />);
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
  const arrive = (next) => {
    act(() => {
      wrapper.setProps(next);
    });
    wrapper.update();
  };

  return { wrapper, find, click, type, valueOf, arrive };
};

describe('MarketplaceLicence', () => {
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

  // the parent dispatches the GET in an effect, so the stored id always arrives after mount
  test('the stored customer id reaches the field when the answer arrives', () => {
    const { valueOf, arrive } = render();

    arrive({ configured: true, customerId: 'acme' });

    expect(valueOf('customerIdField')).toBe('acme');
  });

  test('a typed customer id is not thrown away by an unrelated re-render', () => {
    const { type, valueOf, arrive } = render({ configured: true, customerId: 'acme' });

    type('customerIdField', 'globex');
    arrive({ configured: true, customerId: 'acme', loading: true });

    expect(valueOf('customerIdField')).toBe('globex');
  });

  test('says explicitly that the stored key cannot be shown, nor reused to save', () => {
    // The copy rides the field's own help slot, so it is read off the field rather than off a
    // paragraph beside it — and asserting the prop is what keeps this true if the kit ever
    // changes where it paints that text.
    const { find } = render({ configured: true, customerId: 'acme' });
    const hint = find('licenceKeyField').first().prop('helpText');

    expect(hint).toMatch(/never shown again/i);
    expect(hint).toMatch(/paste the key again/i);
  });

  test('the key field carries no help text until a key is actually stored', () => {
    const { find } = render();

    expect(find('licenceKeyField').first().prop('helpText')).toBeUndefined();
  });

  test('submitting sends the customer id and the key that was typed', () => {
    const onSubmit = jest.fn();
    const { type, click } = render({ onSubmit });

    type('customerIdField', 'acme');
    type('licenceKeyField', 'c2VjcmV0');
    click('submitLicence');

    expect(onSubmit).toHaveBeenCalledWith({ customerId: 'acme', privateKey: 'c2VjcmV0' });
  });

  // PUT /v1/plugins/licence takes both halves or neither: a blank key is refused here rather
  // than sent as an empty string and refused as a 400
  test('saving is refused while either half is missing', () => {
    const { find, type } = render();
    const isDisabled = () => find('submitLicence').first().prop('disabled');

    expect(isDisabled()).toBe(true);

    type('customerIdField', 'acme');
    expect(isDisabled()).toBe(true);

    type('licenceKeyField', 'c2VjcmV0');
    expect(isDisabled()).toBe(false);
  });

  // @NotBlank, not @NotEmpty: whitespace is as refused there as an empty string is
  test('saving is refused while the key is nothing but whitespace', () => {
    const { find, type } = render();

    type('customerIdField', 'acme');
    type('licenceKeyField', '   ');

    expect(find('submitLicence').first().prop('disabled')).toBe(true);
  });

  test('a key pasted with whitespace around it is sent without it', () => {
    const onSubmit = jest.fn();
    const { type, click } = render({ onSubmit });

    type('customerIdField', 'acme');
    type('licenceKeyField', '  c2VjcmV0\n');
    click('submitLicence');

    expect(onSubmit).toHaveBeenCalledWith({ customerId: 'acme', privateKey: 'c2VjcmV0' });
  });

  test('a stored key is no substitute for typing one: saving still needs the key', () => {
    const { find } = render({ configured: true, customerId: 'acme' });

    expect(find('submitLicence').first().prop('disabled')).toBe(true);
  });

  test('the key does not outlive the request that carried it', () => {
    const { type, click, valueOf } = render();

    type('customerIdField', 'acme');
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
