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
import { AddLicenceModal, isBase64Shaped } from './addLicenceModal';

// 16 base64 characters: a multiple of four, so it needs no padding
const GOOD_KEY = 'QUJDREVGR0hJSktM';

const render = ({ onSubmit = () => {}, error = null } = {}) => {
  // ModalLayout is connected, so it needs a store even though this dialog reads nothing from one
  const store = createStore((state = { location: { payload: {} } }) => state);
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <AddLicenceModal data={{ onSubmit, error }} />
      </IntlProvider>
    </Provider>,
  );

  const field = (id) => wrapper.find(`[data-automation-id="${id}"]`).first();
  const type = (id, value) => {
    act(() => {
      field(id).prop('onChange')({ target: { value } });
    });
    wrapper.update();
  };
  const blur = (id) => {
    act(() => {
      field(id).prop('onBlur')();
    });
    wrapper.update();
  };
  const okButton = () => wrapper.find('ModalLayout').first().prop('okButton');
  const closed = jest.fn();
  const confirm = () => {
    act(() => {
      okButton().onClick(closed);
    });
  };

  return { wrapper, field, type, blur, okButton, confirm, closed };
};

const fill = (r, { customerId = 'acme-corp', key = GOOD_KEY } = {}) => {
  r.type('customerIdField', customerId);
  r.type('licenceKeyField', key);
};

describe('isBase64Shaped', () => {
  // ADR-011 puts the real verdict at artifact download, where the registry holds the entitlement.
  // This catches a paste that was cut short or picked up stray characters, and claims nothing else.
  test.each([
    ['plain base64', 'QUJDREVGR0hJSktM', true],
    ['one pad character', 'QUJDREVGR0hJSkt=', true],
    ['two pad characters', 'QUJDREVGR0hJSg==', true],
    ['the full alphabet', 'ab+/YZ09ABcdEFgh', true],
    ['truncated — not a multiple of four', 'QUJDREVGR0hJSkt', false],
    ['a character outside the alphabet', 'QUJDREVGR0hJSkt*', false],
    ['padding in the middle', 'QUJD=EVGR0hJSktM', false],
    ['three pad characters', 'QUJDREVGR0hJS===', false],
    ['empty', '', false],
  ])('%s', (_, value, expected) => {
    expect(isBase64Shaped(value)).toBe(expected);
  });

  // PEM is what the spec said before Ilya confirmed base64, and a PEM-shaped paste has to be
  // rejected rather than sent — the header lines are not base64 characters.
  test('a PEM block is not a base64 key', () => {
    expect(isBase64Shaped('-----BEGIN PRIVATE KEY-----')).toBe(false);
  });
});

describe('AddLicenceModal', () => {
  test('both fields are required, and nothing can be sent until both are filled', () => {
    const r = render();

    expect(r.okButton().disabled).toBe(true);

    r.type('customerIdField', 'acme-corp');
    expect(r.okButton().disabled).toBe(true);

    r.type('licenceKeyField', GOOD_KEY);
    expect(r.okButton().disabled).toBe(false);
  });

  /**
   * Trimmed before anything else. A key pasted out of a mail client or a terminal arrives with
   * stray spaces and newlines, and refusing a correct key over invisible whitespace is the worst
   * failure this dialog could produce — the admin cannot see what is wrong.
   */
  describe('whitespace around a pasted value', () => {
    test('a key wrapped in whitespace is accepted', () => {
      const r = render();
      fill(r, { key: `\n  ${GOOD_KEY}\n` });

      expect(r.okButton().disabled).toBe(false);
    });

    test('and it is sent without the whitespace', () => {
      const onSubmit = jest.fn();
      const r = render({ onSubmit });
      fill(r, { customerId: '  acme-corp  ', key: `  ${GOOD_KEY}  ` });
      r.confirm();

      expect(onSubmit).toHaveBeenCalledWith({
        customerId: 'acme-corp',
        privateKey: GOOD_KEY,
      });
    });

    test('whitespace alone is not a value', () => {
      const r = render();
      fill(r, { customerId: '   ', key: '   ' });

      expect(r.okButton().disabled).toBe(true);
    });
  });

  describe('a key that cannot be right', () => {
    /**
     * The string that was here described PKCS#8 PEM and asked the admin to "paste the whole key,
     * including the BEGIN and END lines". base64 has no such lines, so it asked for something that
     * cannot exist and would send a correct paste back to be re-done.
     */
    test('the error describes a mis-paste, and asks for nothing PEM-shaped', () => {
      const r = render();
      fill(r, { key: 'QUJDREVGR0hJSkt' });
      r.blur('licenceKeyField');

      const message = r.field('licenceKeyField').prop('error');

      expect(message).toBe(
        "That doesn't look like a complete license key. Paste the whole value delivered with your purchase.",
      );
      expect(message).not.toMatch(/BEGIN|END/);
    });

    test('it cannot be submitted', () => {
      const r = render();
      fill(r, { key: 'not base64 at all!' });

      expect(r.okButton().disabled).toBe(true);
    });

    // claims nothing about validity, which this screen cannot judge
    test('the message does not call the licence invalid', () => {
      const r = render();
      fill(r, { key: 'QUJDREVGR0hJSkt' });

      expect(r.field('licenceKeyField').prop('error')).not.toMatch(/invalid|expired|wrong/i);
    });
  });

  /**
   * `Add Modal Required` and `Add Modal Invalid` are one modal at one height — "each failing field
   * takes the error outline, and its helper line is replaced by the message. The modal does not
   * grow." Both kit fields stack the two by default, so this is a rule the component has to
   * enforce rather than inherit.
   *
   * Kills passing `helpText` unconditionally, on either field.
   */
  describe('a field showing a message does not also show its helper', () => {
    test('the customer ID replaces its helper', () => {
      const r = render();
      r.type('customerIdField', '');
      r.blur('customerIdField');

      expect(r.field('customerIdField').prop('error')).toBeTruthy();
      expect(r.field('customerIdField').prop('helpText')).toBeUndefined();
    });

    test('the key replaces its helper', () => {
      const r = render();
      fill(r, { key: 'QUJDREVGR0hJSkt' });
      r.blur('licenceKeyField');

      expect(r.field('licenceKeyField').prop('error')).toBeTruthy();
      expect(r.field('licenceKeyField').prop('helpText')).toBeUndefined();
    });

    // the helper is what the field says when it has nothing to complain about, so it must be
    // there the rest of the time — this is a replacement, not a removal
    test('an untouched field still explains itself', () => {
      const r = render();

      expect(r.field('customerIdField').prop('helpText')).toContain('Delivered together with');
      expect(r.field('licenceKeyField').prop('helpText')).toContain('Stored encrypted');
    });

    test('and so does one that has been filled correctly', () => {
      const r = render();
      fill(r);
      r.blur('customerIdField');
      r.blur('licenceKeyField');

      expect(r.field('customerIdField').prop('helpText')).toContain('Delivered together with');
      expect(r.field('licenceKeyField').prop('helpText')).toContain('Stored encrypted');
    });
  });

  // A wrapped key is how a delivered key arrives, and a single-line input mangles it silently.
  // Asserted on the element rather than the component: the kit's flex field is a forwardRef whose
  // display name is minified, and what matters here is what reaches the DOM.
  test('the key field takes more than one line', () => {
    const { wrapper } = render();

    expect(wrapper.find('textarea[data-automation-id="licenceKeyField"]')).not.toHaveLength(0);
    expect(wrapper.find('input[data-automation-id="licenceKeyField"]')).toHaveLength(0);
  });

  // Said here and again on success: the key is checked at install, not at save. Without both, the
  // first sign of a bad key is a failed install days later in a different part of the product.
  test('it sets the expectation before the admin commits', () => {
    const notice = render().field('licenceNotice').text();

    expect(notice).toContain('How the license is used');
    expect(notice).toContain('when you install or upgrade a premium plugin');
  });

  test('the dialog closes on confirm and hands both values over', () => {
    const onSubmit = jest.fn();
    const r = render({ onSubmit });
    fill(r);
    r.confirm();

    expect(r.closed).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith({ customerId: 'acme-corp', privateKey: GOOD_KEY });
  });

  test('a server rejection of an earlier attempt is shown over the form', () => {
    const { wrapper } = render({ error: 'Customer not recognised' });

    expect(wrapper.find('[data-automation-id="licenceError"]').first().text()).toContain(
      'Customer not recognised',
    );
  });
});
