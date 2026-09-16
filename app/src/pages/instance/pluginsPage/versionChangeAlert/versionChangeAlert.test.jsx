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
import { VersionChangeAlert } from './versionChangeAlert';

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <VersionChangeAlert pluginName="Jira Cloud" installedVersion="5.7.0" {...props} />
    </IntlProvider>,
  );

const text = (wrapper) => wrapper.find('[data-automation-id="versionChangeAlert"]').first().text();

describe('VersionChangeAlert', () => {
  /**
   * The install is atomic, so the first thing an admin needs is not what went wrong but whether
   * they are now somewhere unexpected. They are not, and every message says so before it says
   * anything else.
   */
  describe('every failure opens by saying nothing changed', () => {
    test.each([
      ['Downgrade. Failed Blocked', MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED],
      ['Downgrade. Failed Removed', MARKETPLACE_INSTALL_ERROR.PLUGIN_REMOVED],
      ['Downgrade. Failed Offline', MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE],
    ])('%s', (_, errorCode) => {
      const rendered = text(render({ errorCode }));

      expect(rendered).toContain('Nothing changed');
      // and it names the version the instance is still on, which is the reassurance itself
      expect(rendered).toContain('5.7.0');
      expect(rendered).toContain('Jira Cloud');
    });
  });

  test('a blocked version says the marketplace refuses it, and points at another', () => {
    const rendered = text(render({ errorCode: MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED }));

    expect(rendered).toContain('refuses to serve');
    expect(rendered).toContain('Pick another version');
  });

  /**
   * There is no marketplace path back for a removed plugin, so the copy must not invite a retry
   * that cannot succeed. The one remaining option is conditional — a .jar the admin may already
   * have — and is phrased as such rather than as an instruction to go and archive one.
   */
  test('a removed plugin offers no retry, only the jar the admin may already hold', () => {
    const rendered = text(render({ errorCode: MARKETPLACE_INSTALL_ERROR.PLUGIN_REMOVED }));

    expect(rendered).toContain('removed from the marketplace');
    expect(rendered).toContain('If you kept a .jar');
    expect(rendered).not.toMatch(/try again/i);
  });

  /**
   * Connectivity is not obviously required for a downgrade — an admin can reasonably think the
   * instance is switching between versions it already holds. It is not, so the message says why.
   */
  test('an unreachable registry explains why a downgrade needs the connection at all', () => {
    const rendered = text(render({ errorCode: MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE }));

    expect(rendered).toContain('downloads the plugin again');
    expect(rendered).toContain('Try again');
  });

  test('a failure nobody mapped still says nothing changed, and quotes the server', () => {
    const rendered = text(render({ errorCode: 40099, reason: 'Backend exploded' }));

    expect(rendered).toContain('Nothing changed');
    expect(rendered).toContain('Backend exploded');
  });

  // the server's own prose can run long, and a page that grows a paragraph on failure pushes
  // everything else out of view
  test('the whole message stays reachable even though only two lines are shown', () => {
    const wrapper = render({ errorCode: MARKETPLACE_INSTALL_ERROR.PLUGIN_REMOVED });
    const clamped = wrapper.find('span[title]').first();

    expect(clamped.prop('title')).toContain('removed from the marketplace');
    expect(clamped.prop('title')).toBe(clamped.text());
  });

  test('the alert says which failure it is, for anything reading the page', () => {
    const wrapper = render({ errorCode: MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE });

    expect(wrapper.find('[data-automation-id="versionChangeAlert"]').first().prop('data-error-code'))
      .toBe(MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE);
  });
});
