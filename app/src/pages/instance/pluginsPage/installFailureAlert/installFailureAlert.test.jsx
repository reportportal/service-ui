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
import { MARKETPLACE_INSTALL_ERROR } from 'controllers/plugins/constants';
import { InstallFailureAlert } from './installFailureAlert';

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en">
      <InstallFailureAlert pluginName="Slack" {...props} />
    </IntlProvider>,
  );

// the body only: the header says the same thing for every case, so asserting on it proves nothing
// and asserting through it would hide where each sentence actually starts
const text = (props) => render(props).find('span[title]').first().text();

describe('InstallFailureAlert', () => {
  // D-06. An install that half-succeeds is the reading that frightens, and the install is atomic,
  // so every case can close it off and every case does — before naming any cause.
  describe('what every case says first', () => {
    const cases = [
      ['generic', { errorCode: null }],
      ['licence', { errorCode: MARKETPLACE_INSTALL_ERROR.LICENCE_REJECTED }],
      ['blocked', { errorCode: MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED, version: '5.7.0' }],
      ['unreachable', { errorCode: MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE }],
    ];

    test.each(cases)('%s opens by saying nothing was installed', (_, props) => {
      expect(text(props)).toMatch(/^Nothing was installed/);
    });

    test.each(cases)('%s never claims the plugin keeps running', (_, props) => {
      // the clause belongs to a failed *version change*, where something is still installed. Here
      // there is nothing to keep running, and the License Invalid spec says so outright.
      expect(text(props)).not.toContain('keeps running');
    });
  });

  // ADR-011: the instance never validates the key — the registry does, and only at artifact
  // download — so this is the first and only place a bad licence can surface. The remedy is always
  // elsewhere, which is why the message has to name where.
  test('a rejected licence is sent to where the key lives', () => {
    const body = text({ errorCode: MARKETPLACE_INSTALL_ERROR.LICENCE_REJECTED });

    expect(body).toContain('Server Settings');
    expect(body).toContain('Slack');
  });

  describe('a blocked version', () => {
    const blocked = { errorCode: MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED, version: '5.7.0' };

    // FR-OP-03, and the operator's own words. D-05 keeps unbounded operator text off list
    // tooltips; this is a failure the admin opened deliberately, so the rule does not reach here.
    test('the operator’s reason is quoted verbatim', () => {
      expect(text({ ...blocked, reason: 'Ships a vulnerable log4j' })).toContain(
        'Ships a vulnerable log4j',
      );
    });

    test('it names the version that was refused, not the plugin’s newest', () => {
      expect(text({ ...blocked, version: '5.2.1' })).toContain('5.2.1');
    });

    // the spec asks for both escapes, because one of them is the only route left on an air-gapped
    // instance and neither is discoverable from here
    test('both ways out are named', () => {
      const body = text({ ...blocked, reason: 'Withdrawn' });

      expect(body).toContain('another version');
      expect(body).toContain('.jar');
    });

    // an operator who ended their sentence and one who did not must read the same
    test('the quoted reason is punctuated once', () => {
      expect(text({ ...blocked, reason: 'Withdrawn.' })).not.toContain('Withdrawn..');
      expect(text({ ...blocked, reason: 'Withdrawn' })).toContain('Withdrawn.');
    });

    test('a block with no stated reason does not leave a gap where one would be', () => {
      const body = text(blocked);

      expect(body).toContain('refuses to serve version 5.7.0.');
      expect(body).toContain('another version');
    });
  });

  describe('an unreachable registry', () => {
    const offline = { errorCode: MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE };

    // ADR-004 lets an enterprise point the instance at its own registry, so a literal host is
    // least useful to exactly the reader most likely to see this. Retracted 2026-09-08.
    test('no address is named', () => {
      expect(text(offline)).not.toMatch(/http|registry\./);
    });

    // temporary by nature, so it ends on when rather than on a workaround
    test('it ends on when to try again', () => {
      expect(text(offline).trimEnd()).toMatch(/back\.$/);
    });

    // this is the one case where something else *is* still running, and saying so is the point
    test('it says installed plugins are unaffected', () => {
      expect(text(offline)).toContain('already installed keep running');
    });
  });

  // the catch-all: if a failure deserves its own words it gets its own code and stops arriving
  // here, so this one must not invent a cause it cannot know
  describe('anything else', () => {
    test('it points at the log rather than guessing', () => {
      expect(text({ errorCode: 40099 })).toContain('server log');
    });

    test('an unmapped code falls here rather than rendering blank', () => {
      expect(text({ errorCode: 40099 }).length).toBeGreaterThan(40);
    });

    // the incompatibility codes are refused before the dialog is ever confirmed, so they arrive
    // here only when something changed between listing and install — no special wording exists
    test('a compatibility refusal is not given words it has not earned', () => {
      expect(text({ errorCode: MARKETPLACE_INSTALL_ERROR.PLUGIN_INCOMPATIBLE })).toContain(
        'server log',
      );
    });
  });

  test('the code is on the element, so a test or a support reader can see which case drew it', () => {
    const wrapper = render({ errorCode: MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED });

    expect(
      wrapper.find('[data-automation-id="installFailureAlert"]').first().prop('data-error-code'),
    ).toBe(MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED);
  });
});
