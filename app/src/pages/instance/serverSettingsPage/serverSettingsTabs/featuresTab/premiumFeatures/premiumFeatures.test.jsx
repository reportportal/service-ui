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

import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { PremiumFeatures } from './premiumFeatures';
import { AddLicenceModal } from './addLicenceModal';

const render = (props = {}) => {
  const wrapper = mount(
    <IntlProvider locale="en" onError={() => {}}>
      <PremiumFeatures isAdmin {...props} />
    </IntlProvider>,
  );
  const find = (id) => wrapper.find(`[data-automation-id="${id}"]`);

  return { wrapper, find };
};

describe('PremiumFeatures', () => {
  // Settings. License Key. Empty (27492:17402). The state almost every instance is in, and the
  // only question it answers is whether the admin needs a licence at all — so it does not put two
  // fields that will stay blank forever in front of everyone who does not.
  describe('with no licence stored', () => {
    test('no field is on screen until the admin acts', () => {
      const { find } = render();

      expect(find('licenceEmptyState')).not.toHaveLength(0);
      expect(find('customerIdField')).toHaveLength(0);
      expect(find('licenceKeyField')).toHaveLength(0);
    });

    test('it says what a licence is for, and offers one action', () => {
      const { find } = render();

      expect(find('licenceEmptyState').first().text()).toContain(
        'Premium plugins need a license to install',
      );
      expect(find('addLicence').first().text()).toBe('Add License');
    });

    // there is nothing to renew before there is a key, and this state already has its action
    test('renewal is not offered before there is a licence', () => {
      expect(render().find('requestLicenceRenewal')).toHaveLength(0);
    });

    test('the action opens the dialog rather than revealing a form', () => {
      const showModal = jest.fn();
      render({ showModal }).find('addLicence').first().prop('onClick')();

      expect(showModal).toHaveBeenCalledTimes(1);
      expect(showModal.mock.calls[0][0].component.type).toBe(AddLicenceModal);
    });
  });

  // Settings. License Key. Submitted (27562:16039)
  describe('with a licence stored', () => {
    const stored = { configured: true, customerId: 'acme-corp' };

    test('the card names the customer and stands in for the key rather than showing it', () => {
      const { find } = render(stored);

      expect(find('licenceCustomerId').first().text()).toBe('acme-corp');
      expect(find('licenceCard').first().text()).not.toContain('acme-key');
    });

    /**
     * The one rule in this flow that is not a judgement call. An Edit affordance would imply the
     * key can be read back, and it cannot — no endpoint returns it. Replacing a licence is delete
     * then add, and the delete dialog is where the gap between the two is stated.
     */
    test('there is no way to edit it, only to delete it', () => {
      const { wrapper, find } = render(stored);
      const labels = wrapper.find('button').map((node) => node.text().toLowerCase());

      expect(labels.some((label) => label.includes('edit'))).toBe(false);
      expect(labels.some((label) => label.includes('save'))).toBe(false);
      expect(find('removeLicence')).not.toHaveLength(0);
    });

    test('deleting asks first, and says what survives before what stops', () => {
      const showModal = jest.fn();
      render({ ...stored, showModal })
        .find('removeLicence')
        .first()
        .prop('onClick')();

      const { data } = showModal.mock.calls[0][0];

      expect(data.dangerConfirm).toBe(true);
      expect(data.message).toContain('will be removed from this instance');
      // the rotation gap, and the only place it is said
      expect(data.message).toContain('until a license is added');
    });

    test('nothing is removed until the dialog is confirmed', () => {
      const onRemove = jest.fn();
      const showModal = jest.fn();
      render({ ...stored, onRemove, showModal })
        .find('removeLicence')
        .first()
        .prop('onClick')();

      expect(onRemove).not.toHaveBeenCalled();

      showModal.mock.calls[0][0].data.onConfirm();

      expect(onRemove).toHaveBeenCalled();
    });

    /**
     * ReportPortal's own support address, the same on every instance — which is what makes a fixed
     * value right here. Deliberately not the `Contact Us` footer link, which points wherever the
     * customer's own admin set it, and deliberately the bare entry rather than the one that
     * prefills a subject.
     */
    describe('Request License Renewal', () => {
      test('it goes to support, with nothing prefilled', () => {
        const href = render(stored).find('requestLicenceRenewal').first().prop('href');

        expect(href).toBe(referenceDictionary.rpEmail);
        expect(href).not.toContain('subject');
      });

      test('it is a link out of the product, not a button', () => {
        const link = render(stored).find('requestLicenceRenewal').first();

        expect(link.name()).toBe('a');
        expect(link.text()).toContain('Request License Renewal');
      });
    });

    // Says the same thing the dialog's notice said, at the moment the admin would otherwise assume
    // the job is finished: the key is checked at install, not at save.
    test('a saved licence is confirmed without claiming it works', () => {
      const text = render({ ...stored, saved: true })
        .find('licenceSaved')
        .first()
        .text();

      expect(text).toContain('successfully added');
      expect(text).toContain('checked the first time you do');
    });

    test('the confirmation is absent until something was actually saved', () => {
      expect(render(stored).find('licenceSaved')).toHaveLength(0);
    });
  });

  // the endpoint behind all of this is admin-only, so for anyone else there is nothing to show
  test('a non-admin sees no section at all', () => {
    const { wrapper } = render({ isAdmin: false, configured: true });

    expect(wrapper.find('[data-automation-id="premiumFeatures"]')).toHaveLength(0);
  });
});
