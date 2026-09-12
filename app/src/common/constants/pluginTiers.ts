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

/**
 * The registry classifies a plugin on two axes that constrain each other in no way: a plugin can
 * be a partner's and premium at once, and either value says nothing about the other. Folding the
 * two into one field is what threw trust away, so they are two here and stay two on the row.
 */

/** Who stands behind the plugin. The registry spells this axis `tier` on the wire. */
export const PLUGIN_TRUST_TIERS = {
  OFFICIAL: 'official',
  PARTNER: 'partner',
} as const;

export type PluginTrustTier = (typeof PLUGIN_TRUST_TIERS)[keyof typeof PLUGIN_TRUST_TIERS];

/** What it takes to install the plugin. The registry spells this axis `access`. */
export const PLUGIN_ACCESS_TIERS = {
  PUBLIC: 'public',
  PREMIUM: 'premium',
} as const;

export type PluginAccessTier = (typeof PLUGIN_ACCESS_TIERS)[keyof typeof PLUGIN_ACCESS_TIERS];

/**
 * What a row costs. Not a wire value: it is `access` in the words the design prints. A row
 * carries it under the name `tier`, which on the wire means the other axis — the trust axis of
 * a row is `trust`.
 */
export const PLUGIN_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type PluginTier = (typeof PLUGIN_TIERS)[keyof typeof PLUGIN_TIERS];

const TRUST_TIERS: readonly string[] = Object.values(PLUGIN_TRUST_TIERS);

/** The access axis as the tier a row prints. Anything short of premium costs nothing. */
export const toPluginTier = (access?: string | null): PluginTier =>
  access === PLUGIN_ACCESS_TIERS.PREMIUM ? PLUGIN_TIERS.PREMIUM : PLUGIN_TIERS.FREE;

/**
 * The trust axis, or null for a value this UI has no mark for. Unknown is not a tier: nothing is
 * drawn for it rather than a mark that would claim the wrong thing about who wrote the plugin.
 */
export const toTrustTier = (tier?: string | null): PluginTrustTier | null =>
  tier && TRUST_TIERS.includes(tier) ? (tier as PluginTrustTier) : null;
