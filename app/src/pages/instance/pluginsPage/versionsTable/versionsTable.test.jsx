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
import { VersionMark } from '../versionMark';
import { VersionsTable } from './versionsTable';

// midday UTC, so the day a date renders on is the same in every timezone a CI box might run in
const VERSIONS = [
  { version: '5.6.0', publishedAt: '2025-11-04T12:00:00Z', compatible: true },
  { version: '5.8.0', publishedAt: '2026-03-12T12:00:00Z', compatible: true },
  { version: '5.6.1', publishedAt: '2025-12-18T12:00:00Z', compatible: true },
  { version: '5.7.0', publishedAt: '2026-02-02T12:00:00Z', compatible: true },
];

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <VersionsTable versions={VERSIONS} onUseVersion={() => {}} {...props} />
    </IntlProvider>,
  );

const find = (scope, id) => scope.find(`[data-automation-id="${id}"]`);
const rows = (wrapper) =>
  find(wrapper, 'pluginVersionRow').map((node) => node.prop('data-version'));
const rowFor = (wrapper, version) =>
  find(wrapper, 'pluginVersionRow').filterWhere((node) => node.prop('data-version') === version);
const actionOf = (wrapper, version) => rowFor(wrapper, version).find('button[data-action]').first();
// the marks carry their explanation as tooltip content now, not as the browser's `title`
const tooltipOf = (wrapper, version, automationId) =>
  find(rowFor(wrapper, version), automationId).first().parents(VersionMark).first()
    .prop('tooltipContent');
const expand = (wrapper, version) => {
  act(() => {
    find(rowFor(wrapper, version), 'expandVersion').first().prop('onClick')();
  });
  wrapper.update();
};

describe('VersionsTable', () => {
  describe('Versions. Table. Default', () => {
    // by version, not by publish date: a patch for an older branch can be published after a newer
    // release, and ordering by date would put it above the newest build
    test('newest first, by version rather than by the date it was published', () => {
      expect(rows(render())).toEqual(['5.8.0', '5.7.0', '5.6.1', '5.6.0']);
    });

    test('the columns the design names are there', () => {
      expect(find(render(), 'versionsColumns').first().text()).toBe('VersionReleased');
    });

    test('a row states the date the registry published it', () => {
      expect(rowFor(render(), '5.8.0').text()).toContain('Mar 12, 2026');
    });

    test('with nothing installed every row installs', () => {
      const wrapper = render();

      expect(actionOf(wrapper, '5.8.0').prop('data-action')).toBe('INSTALL');
      expect(actionOf(wrapper, '5.6.0').prop('data-action')).toBe('INSTALL');
    });

    test('against an installed version a row moves forward, back, or is the one running', () => {
      const wrapper = render({ installedVersion: '5.7.0' });

      expect(actionOf(wrapper, '5.8.0').prop('data-action')).toBe('UPGRADE');
      expect(actionOf(wrapper, '5.6.1').prop('data-action')).toBe('DOWNGRADE');
      expect(find(rowFor(wrapper, '5.7.0'), 'installedVersionMarker')).toHaveLength(1);
      expect(find(rowFor(wrapper, '5.7.0'), 'useVersionAction')).toHaveLength(0);
    });

    test('the version picked is the version handed up', () => {
      const posted = [];
      const wrapper = render({ installedVersion: '5.7.0', onUseVersion: (v) => posted.push(v) });

      actionOf(wrapper, '5.6.1').prop('onClick')();

      expect(posted).toEqual(['5.6.1']);
    });

    test('nothing to show, nothing rendered', () => {
      const wrapper = render({ versions: [] });

      expect(find(wrapper, 'pluginVersions')).toHaveLength(0);
      expect(rows(wrapper)).toHaveLength(0);
    });
  });

  /**
   * Plugin Detail. State. Update Available. There is no banner in the design: an available upgrade
   * is information, not a warning, so the page says it by opening the row that matters. FR-A-04
   * asks the detail page to expose the newer version's changelog, and a reader should not have to
   * go looking for it.
   */
  describe('Plugin Detail. State. Update Available', () => {
    const changelog = { version: '5.8.0', lines: ['Fixed a crash.', 'Added custom issue types.'] };

    test('the newer row is already open, with its release notes readable', () => {
      const wrapper = render({ installedVersion: '5.7.0', changelog });

      expect(find(rowFor(wrapper, '5.8.0'), 'versionReleaseNotes')).toHaveLength(1);
      expect(find(wrapper, 'releaseNoteLine').map((n) => n.text())).toEqual(changelog.lines);
    });

    test('and it is the only one open', () => {
      const wrapper = render({ installedVersion: '5.7.0', changelog });

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(1);
    });

    test('already on the newest build, nothing is more interesting than anything else', () => {
      const wrapper = render({ installedVersion: '5.8.0', changelog });

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(0);
    });

    test('with nothing installed the table starts closed', () => {
      const wrapper = render({ changelog });

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(0);
    });

    // the row that opened is still a row: it closes like any other
    test('the opened row can be closed again', () => {
      const wrapper = render({ installedVersion: '5.7.0', changelog });

      expand(wrapper, '5.8.0');

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(0);
    });
  });

  describe('Versions. Table. Row Expanded', () => {
    const changelog = { version: '5.6.1', lines: ['Restored compatibility.', 'Fixed a duplicate.'] };

    test('an expanded row shows the notes published for that version', () => {
      const wrapper = render({ changelog });

      expand(wrapper, '5.6.1');

      expect(find(wrapper, 'releaseNoteLine').map((n) => n.text())).toEqual(changelog.lines);
    });

    test('rows are closed until asked, and only one is open at a time', () => {
      const wrapper = render({ changelog });

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(0);

      expand(wrapper, '5.6.1');
      expand(wrapper, '5.8.0');

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(1);
      expect(find(rowFor(wrapper, '5.6.1'), 'versionReleaseNotes')).toHaveLength(0);
    });

    test('expanding the open row closes it again', () => {
      const wrapper = render({ changelog });

      expand(wrapper, '5.6.1');
      expand(wrapper, '5.6.1');

      expect(find(wrapper, 'versionReleaseNotes')).toHaveLength(0);
    });
  });

  // the wire carries release notes for one version only, so every other row has genuinely nothing
  // to show — which is its own frame rather than a placeholder
  describe('Versions. Table. Row Expanded Empty', () => {
    test('a version nobody documented says so', () => {
      const wrapper = render({ changelog: { version: '5.6.1', lines: ['Something.'] } });

      expand(wrapper, '5.8.0');

      expect(find(wrapper, 'noReleaseNotes').first().text()).toBe(
        'No changes were documented for this version.',
      );
      expect(find(wrapper, 'releaseNoteLine')).toHaveLength(0);
    });

    test('a changelog with no lines is empty too, not half-rendered', () => {
      const wrapper = render({ changelog: { version: '5.8.0', lines: [] } });

      expand(wrapper, '5.8.0');

      expect(find(wrapper, 'noReleaseNotes')).toHaveLength(1);
    });
  });

  describe('Versions. Table. With Incompatible', () => {
    const mixed = [
      { version: '5.8.0', compatible: false, requires: '>=26.2' },
      { version: '5.7.0', compatible: true },
    ];

    test('the row is marked and its action is dead', () => {
      const wrapper = render({ versions: mixed, productVersion: '26.1' });

      expect(find(rowFor(wrapper, '5.8.0'), 'incompatibleVersionMark')).toHaveLength(1);
      expect(actionOf(wrapper, '5.8.0').prop('disabled')).toBe(true);
    });

    // the design does not print the range: "26.2 or later" and "25.1 or earlier" are two different
    // situations for a reader, and one of them is never solved by upgrading ReportPortal
    test('a build that is too new says which release it needs', () => {
      const wrapper = render({ versions: mixed, productVersion: '26.1' });

      expect(tooltipOf(wrapper, '5.8.0', 'incompatibleVersionMark')).toBe(
        'Needs ReportPortal 26.2 or later. This instance runs 26.1.',
      );
    });

    test('a build that is too old says what it was built for instead', () => {
      const wrapper = render({
        versions: [{ version: '5.6.0', compatible: false, requires: '<=25.1' }],
        productVersion: '26.1',
      });

      expect(tooltipOf(wrapper, '5.6.0', 'incompatibleVersionMark')).toBe(
        'Built for ReportPortal 25.1 or earlier. This instance runs 26.1.',
      );
    });

    test('a range that makes no sentence says only that it does not run here', () => {
      const wrapper = render({
        versions: [{ version: '5.8.0', compatible: false, requires: 'whenever' }],
        productVersion: '26.1',
      });

      expect(tooltipOf(wrapper, '5.8.0', 'incompatibleVersionMark')).toBe(
        "This version doesn't run on the release this instance uses.",
      );
    });

    test('a version that does run is neither marked nor disabled', () => {
      const wrapper = render({ versions: mixed, productVersion: '26.1' });

      expect(find(rowFor(wrapper, '5.7.0'), 'incompatibleVersionMark')).toHaveLength(0);
      expect(actionOf(wrapper, '5.7.0').prop('disabled')).toBe(false);
    });

    // service-api serialises with NON_NULL, so an undecided verdict arrives as nothing at all —
    // and reading that as a refusal would ground every version on an older service-api
    test('a verdict that never arrived is not a refusal', () => {
      const wrapper = render({ versions: [{ version: '5.8.0' }], productVersion: '26.1' });

      expect(find(wrapper, 'incompatibleVersionMark')).toHaveLength(0);
      expect(actionOf(wrapper, '5.8.0').prop('disabled')).toBe(false);
    });
  });

  describe('Versions. Table. No Compatible Versions', () => {
    test('every row marked, every action dead, and the history still readable', () => {
      const wrapper = render({
        versions: VERSIONS.map((v) => ({ ...v, compatible: false, requires: '>=26.2' })),
        productVersion: '26.1',
      });

      expect(find(wrapper, 'incompatibleVersionMark')).toHaveLength(4);
      expect(rows(wrapper)).toHaveLength(4);
      VERSIONS.forEach(({ version }) => {
        expect(actionOf(wrapper, version).prop('disabled')).toBe(true);
      });
    });
  });

  describe('Versions. Table. With Advisory', () => {
    const advisory = {
      severity: 'critical',
      text: 'CVE-2026-1234',
      attachedAt: '2026-02-15T12:00:00Z',
    };

    test('the row is marked and names the severity, the date and where to go', () => {
      const wrapper = render({
        versions: [{ version: '5.7.0', advisory }, { version: '5.8.0' }],
        installedVersion: '5.7.0',
        latestVersion: '5.8.0',
      });
      const tooltip = tooltipOf(wrapper, '5.7.0', 'advisoryVersionMark');

      expect(tooltip).toContain('critical');
      expect(tooltip).toContain('Feb 15, 2026');
      expect(tooltip).toContain('5.8.0');
    });

    // an advisory is a warning, not a lock: refusing to let an admin move off a vulnerable build
    // would be the worse answer
    test('the action stays alive', () => {
      const wrapper = render({
        versions: [{ version: '5.8.0', advisory }, { version: '5.7.0' }],
        installedVersion: '5.7.0',
      });

      expect(actionOf(wrapper, '5.8.0').prop('disabled')).toBe(false);
    });

    test('an advisory on one version is not on the others', () => {
      const wrapper = render({ versions: [{ version: '5.8.0', advisory }, { version: '5.7.0' }] });

      expect(find(rowFor(wrapper, '5.7.0'), 'advisoryVersionMark')).toHaveLength(0);
    });

    test('the two marks are different things and can sit on one row together', () => {
      const wrapper = render({
        versions: [{ version: '5.8.0', advisory, compatible: false, requires: '>=26.2' }],
        productVersion: '26.1',
      });
      const row = rowFor(wrapper, '5.8.0');

      expect(find(row, 'advisoryVersionMark')).toHaveLength(1);
      expect(find(row, 'incompatibleVersionMark')).toHaveLength(1);
    });
  });

  describe('Versions. Table. Blocked Version and Plugin Removed', () => {
    test('a blocked version is marked, never offered', () => {
      const wrapper = render({
        versions: [{ version: '5.8.0', blocked: true }, { version: '5.7.0' }],
        installedVersion: '5.7.0',
      });
      const row = rowFor(wrapper, '5.8.0');

      expect(find(row, 'blockedVersionMark')).not.toHaveLength(0);
      expect(find(row, 'useVersionAction')).toHaveLength(0);
    });

    /**
     * The operator's reason is the one part of a block a reader cannot work out, so it travels to
     * the row it happened to rather than being summarised into the word "Blocked".
     */
    test('the mark carries when it was blocked and why', () => {
      const wrapper = render({
        versions: [
          {
            version: '5.8.0',
            blocked: true,
            blockedAt: '2026-02-15T12:00:00Z',
            blockReason: 'Signed with a revoked key.',
          },
        ],
      });

      const tooltip = tooltipOf(wrapper, '5.8.0', 'blockedVersionMark');
      expect(tooltip).toContain('Feb 15, 2026');
      expect(tooltip).toContain('Signed with a revoked key.');
      expect(tooltip).toContain("can't be reinstalled or downgraded to");
    });

    test('a block with no reason recorded still says when', () => {
      const wrapper = render({
        versions: [{ version: '5.8.0', blocked: true, blockedAt: '2026-02-15T12:00:00Z' }],
      });

      expect(tooltipOf(wrapper, '5.8.0', 'blockedVersionMark')).toBe(
        "Blocked on Feb 15, 2026. It keeps running, but can't be reinstalled or downgraded to.",
      );
    });

    // the blocked version is still the one running: the row keeps saying so, and simply offers
    // nothing, because what happened to it is the mark's to explain
    test('the installed version being blocked does not stop the row naming it', () => {
      const wrapper = render({
        versions: [{ version: '5.7.0', blocked: true }],
        installedVersion: '5.7.0',
      });
      const row = rowFor(wrapper, '5.7.0');

      expect(find(row, 'installedVersionMarker')).toHaveLength(1);
      expect(find(row, 'useVersionAction')).toHaveLength(0);
    });

    // the registry answers 410 for every version of a removed plugin, so none is reachable
    test('a removed plugin keeps its history and offers none of it', () => {
      const wrapper = render({ removed: true, installedVersion: '5.7.0' });

      expect(rows(wrapper)).toHaveLength(4);
      expect(find(wrapper, 'useVersionAction')).toHaveLength(0);
    });

    test('a page that offers no version actions still lists the versions', () => {
      const wrapper = render({ onUseVersion: null });

      expect(rows(wrapper)).toHaveLength(4);
      expect(find(wrapper, 'useVersionAction')).toHaveLength(0);
    });

    // which version is running is a state, not an offer, so a table with nothing to offer still
    // says it — a plugin that is not in the marketplace has exactly one row and it is the current
    // one
    test('a table with nothing to offer still names the running version', () => {
      const wrapper = render({ onUseVersion: null, installedVersion: '5.7.0' });

      expect(find(rowFor(wrapper, '5.7.0'), 'installedVersionMarker')).toHaveLength(1);
      expect(find(rowFor(wrapper, '5.8.0'), 'installedVersionMarker')).toHaveLength(0);
    });

    test('a removed plugin still names the version it is running', () => {
      const wrapper = render({ removed: true, installedVersion: '5.7.0' });

      expect(find(rowFor(wrapper, '5.7.0'), 'installedVersionMarker')).toHaveLength(1);
    });

    test('while an install is in flight no other version may start one', () => {
      const wrapper = render({ installing: true, installedVersion: '5.7.0' });

      expect(actionOf(wrapper, '5.8.0').prop('disabled')).toBe(true);
      expect(actionOf(wrapper, '5.6.1').prop('disabled')).toBe(true);
    });
  });
});
