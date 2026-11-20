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

import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import { PLUGIN_TIERS, PLUGIN_TRUST_TIERS } from 'common/constants/pluginTiers';
import { getRowIncompatibility, toAvailableRow, toInstalledRow } from './utils';

const availableEntry = (id) => catalogue.available.find((entry) => entry.id === id);
const slack = availableEntry('plugin-notify-slack');
const azure = availableEntry('plugin-bts-azure');
const jira = catalogue.installed.find((row) => row.name === 'jira');

describe('the two axes the registry publishes', () => {
  // The wire carries `tier` (who wrote it) and `access` (what it costs), and the row used to
  // fold both into one field, so a partner's premium plugin could only be one of the two.
  test('a row states trust and access separately', () => {
    const row = toAvailableRow({ ...azure, tier: PLUGIN_TRUST_TIERS.PARTNER });

    expect(row.trust).toBe(PLUGIN_TRUST_TIERS.PARTNER);
    expect(row.tier).toBe(PLUGIN_TIERS.PREMIUM);
  });

  test('the access axis still reads free or premium, as everything downstream expects', () => {
    expect(toAvailableRow(slack).tier).toBe(PLUGIN_TIERS.FREE);
    expect(toAvailableRow(azure).tier).toBe(PLUGIN_TIERS.PREMIUM);
  });

  test('an available row takes its trust from the catalogue entry', () => {
    expect(toAvailableRow(slack).trust).toBe(PLUGIN_TRUST_TIERS.OFFICIAL);
  });

  // `community` is not a registry value, and whether it should become one is the designer's
  // question, not this mapping's: an unknown tier is no tier rather than a guessed one.
  test('a trust value this UI has no mark for is carried as none at all', () => {
    expect(toAvailableRow({ ...slack, tier: 'community' }).trust).toBeNull();
    expect(toAvailableRow({ ...slack, tier: undefined }).trust).toBeNull();
  });

  test('an installed row takes its trust from the marketplace block', () => {
    expect(toInstalledRow({ name: jira.name }, jira).trust).toBe(PLUGIN_TRUST_TIERS.OFFICIAL);
  });

  // trust is registry-sourced like every other marketplace signal, so it goes with the block
  test('an installed row whose block cannot be believed claims no trust', () => {
    expect(toInstalledRow({ name: jira.name }, jira, false).trust).toBeNull();
    expect(toInstalledRow({ name: jira.name }, undefined).trust).toBeNull();
  });
});

describe('what an installed row says about the version it runs', () => {
  const find = (name) => catalogue.installed.find((row) => row.name === name);
  const rowOf = (name) => toInstalledRow({ name, details: { version: find(name).version } }, find(name));

  test('the capped version is a running refusal carrying the operator’s reason', () => {
    expect(getRowIncompatibility(rowOf('zephyr'))).toEqual({
      running: true,
      version: '3.1.0',
      requires: '>=25.1, <26.0',
      reason: 'Breaks the launch view on 26.0',
    });
  });

  test('a withheld update is still the update sentence when the running version is fine', () => {
    expect(getRowIncompatibility(rowOf('sauce-labs'))).toMatchObject({ newer: true, version: '5.0.0' });
  });

  test('a running refusal outranks a withheld update', () => {
    const row = toInstalledRow(
      { name: 'x', details: { version: '1.0.0' } },
      {
        marketplace: {
          latestVersion: '2.0.0',
          compatible: false,
          requires: '>=27',
          installedCompatibility: { compatible: false, requires: '<26' },
        },
      },
    );

    expect(getRowIncompatibility(row)).toMatchObject({ running: true, reason: null });
  });

  test('an unknown verdict, `{}`, or a current plugin says nothing', () => {
    expect(getRowIncompatibility(rowOf('jira'))).toBeNull();
    const unknown = toInstalledRow(
      { name: 'x', details: { version: '1.0.0' } },
      { marketplace: { installedCompatibility: {} } },
    );
    expect(getRowIncompatibility(unknown)).toBeNull();
  });

  test('an installed row that is out of range with nothing newer is no longer guessed at', () => {
    const row = toInstalledRow(
      { name: 'x', details: { version: '2.0.0' } },
      { marketplace: { latestVersion: '2.0.0', compatible: false, requires: '>=27' } },
    );

    expect(getRowIncompatibility(row)).toBeNull();
  });

  test('a row without a believable block carries no verdict', () => {
    expect(toInstalledRow({ name: 'zephyr' }, find('zephyr'), false).installedCompatibility).toBeNull();
  });
});
