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

import { ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE, PLUGIN_FILTER_GROUP_VALUES } from 'common/constants/pluginsFilter';
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';

export const PREMIUM_ACCESS = 'premium';

/** What a row is, stated outright: no row may be classified by a field it happens to carry. */
export const ROW_KINDS = {
  INSTALLED: 'INSTALLED',
  AVAILABLE: 'AVAILABLE',
};

/** The three mutually exclusive row actions. Uninstall lives on the plugin page, not here. */
export const ROW_ACTIONS = {
  INSTALL: 'INSTALL',
  UPDATE: 'UPDATE',
  DISCOVER_PREMIUM: 'DISCOVER_PREMIUM',
};

/**
 * The row's own state, as opposed to anything the registry said. Local and always knowable, so
 * unlike the marketplace signals it survives an unreachable registry — the toggle that used to
 * carry it did too. It takes the action slot: a plugin that is switched off has nothing to
 * offer there, and the design shows the state where the action would have been.
 */
export const ROW_STATES = {
  DISABLED: 'DISABLED',
};

/**
 * What the row shows instead of an action, or null when it should show the action.
 *
 * <p>Read off `enabled === false` rather than `!enabled`: an available row has no such field,
 * and undefined must not read as "switched off".
 */
export const getRowState = (row) =>
  !isAvailableRow(row) && row.enabled === false ? ROW_STATES.DISABLED : null;

/** Marketplace-sourced signals a row can carry. All of them are unverifiable while offline. */
export const ROW_BADGES = {
  ADVISORY: 'ADVISORY',
  BLOCKED: 'BLOCKED',
  REMOVED: 'REMOVED',
};

/**
 * The name to print for a row.
 *
 * <p>ReportPortal's own label first — it is what every other screen calls this plugin — then the
 * registry's, then the identifier. The middle step is what stops a PF4J id like `jira` or `ldap`
 * being printed in a list where the row beside it says "Azure DevOps": those plugins carry no
 * local display name at all, and the registry is the only place one exists.
 */
export const getDisplayName = ({ details, marketplace, name }) =>
  details?.name || marketplace?.name || name || '';

/** The one-line description under the name. Available rows carry their own; installed rows read
 * the registry's, which is absent while offline or unmatched — and then the row simply has none. */
export const getDescription = ({ description, marketplace }) =>
  description || marketplace?.description || '';

/**
 * Who wrote the plugin, per the registry.
 *
 * <p>`uploadedBy` first, because for a hand-uploaded plugin that is the only fact anyone has.
 * Then the registry's author. There is deliberately no third fallback: the row used to end in
 * `|| 'ReportPortal'`, which printed a false attribution on every third-party plugin in the
 * catalogue. An unknown author is unknown, and the line is left out.
 */
export const getAuthor = ({ uploadedBy, author, marketplace }) =>
  uploadedBy || author || marketplace?.author || '';

/**
 * Whether the registry half of a response may be believed. Offline the registry never answered,
 * and after a failure nothing answered at all, so in neither case is any marketplace-sourced
 * signal verifiable. An unmatched plugin has no registry half at all: it was never asked about,
 * so whatever the store still holds belongs to some other plugin. The catalogue and the plugin
 * page share this one rule so the two screens cannot come to disagree about what they claim.
 */
export const isMarketplaceTrusted = ({ offline = false, failed = false, unmatched = false } = {}) =>
  !offline && !failed && !unmatched;

const groupRank = (groupType) => {
  const idx = PLUGIN_FILTER_GROUP_VALUES.indexOf(groupType);
  return idx < 0 ? PLUGIN_FILTER_GROUP_VALUES.length : idx;
};

export const sortByGroupAndName = (a, b) =>
  groupRank(a.groupType) - groupRank(b.groupType) ||
  getDisplayName(a).localeCompare(getDisplayName(b));

export const sortByTierGroupAndName = (a, b) =>
  (a.tier !== PLUGIN_TIERS.PREMIUM) - (b.tier !== PLUGIN_TIERS.PREMIUM) || sortByGroupAndName(a, b);

/** An `available` entry of GET /v1/plugins turned into the row shape the list renders. */
export const toAvailableRow = (entry) => ({
  kind: ROW_KINDS.AVAILABLE,
  registryId: entry.id,
  name: entry.name,
  details: { name: entry.name, version: entry.latestVersion },
  description: entry.description,
  author: entry.author || null,
  groupType: entry.groupType,
  latestVersion: entry.latestVersion,
  contactUrl: entry.contactUrl || null,
  locked: Boolean(entry.locked),
  tier: entry.access === PREMIUM_ACCESS ? PLUGIN_TIERS.PREMIUM : PLUGIN_TIERS.FREE,
});

/**
 * A locally installed plugin plus its marketplace block. The block is null while the registry
 * is offline and for a plugin the registry could not match, and in both cases nothing
 * marketplace-sourced can be claimed about the row.
 *
 * `marketplaceTrusted` is false whenever the registry-sourced half of the catalogue is not
 * something this screen can vouch for. The block is then dropped here rather than trusted to
 * arrive empty: the backend nulling it is a contract, not a guarantee the UI may lean on.
 *
 * The registry id is read from inside the block, which is where the wire carries it: it is a
 * marketplace-sourced fact, so a row without a block has no known registry id at all.
 */
export const toInstalledRow = (plugin, mergedEntry, marketplaceTrusted = true) => {
  const marketplace = (marketplaceTrusted && mergedEntry?.marketplace) || null;

  return {
    ...plugin,
    kind: ROW_KINDS.INSTALLED,
    marketplace,
    registryId: marketplace?.pluginId || null,
    updateAvailable: marketplace?.updateAvailable?.version || null,
  };
};

export const mergeInstalledRows = (plugins, mergedInstalled, marketplaceTrusted = true) =>
  plugins.map((plugin) =>
    toInstalledRow(
      plugin,
      mergedInstalled.find((entry) => entry.name === plugin.name),
      marketplaceTrusted,
    ),
  );

export const isAvailableRow = (row) => row.kind === ROW_KINDS.AVAILABLE;

export const isDegradedRow = (row) => !isAvailableRow(row) && !row.marketplace;

export const getRowAction = (row) => {
  if (isAvailableRow(row)) {
    // a premium plugin with no licence configured can only be enquired about, not installed
    return row.locked ? ROW_ACTIONS.DISCOVER_PREMIUM : ROW_ACTIONS.INSTALL;
  }

  // on an installed row every remaining signal is read straight out of the marketplace block,
  // so a row without one offers nothing: none of it is verifiable
  return row.marketplace?.updateAvailable ? ROW_ACTIONS.UPDATE : null;
};

/** Badges an installed row shows; the tier badge of an available row is rendered from `tier`. */
export const getRowBadges = (row) => {
  if (isAvailableRow(row) || isDegradedRow(row)) {
    return [];
  }

  const { advisory, blocked, removed } = row.marketplace;

  return [
    removed && ROW_BADGES.REMOVED,
    blocked && ROW_BADGES.BLOCKED,
    advisory && ROW_BADGES.ADVISORY,
  ].filter(Boolean);
};

const matchesCategory = (row, category) =>
  category === ALL_GROUP_TYPE || category === INSTALLED_GROUP_TYPE || row.groupType === category;

const matchesQuery = (row, query) => {
  const normalized = query.trim().toLowerCase();

  return !normalized || getDisplayName(row).toLowerCase().includes(normalized);
};

/** The chip and the query narrow both groups the same way. */
export const filterRows = (rows, category, query) =>
  rows.filter((row) => matchesCategory(row, category) && matchesQuery(row, query));
