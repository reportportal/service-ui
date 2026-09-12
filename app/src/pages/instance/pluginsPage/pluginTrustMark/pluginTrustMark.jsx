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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { PLUGIN_TRUST_TIERS } from 'common/constants/pluginTiers';
import styles from './pluginTrustMark.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  official: {
    id: 'PluginTrustMark.official',
    defaultMessage: 'Official',
  },
  officialTooltip: {
    id: 'PluginTrustMark.officialTooltip',
    defaultMessage: 'Official — built and maintained by the ReportPortal team.',
  },
  partner: {
    id: 'PluginTrustMark.partner',
    defaultMessage: 'Partner',
  },
  partnerTooltip: {
    id: 'PluginTrustMark.partnerTooltip',
    defaultMessage: 'Partner — built by third-party vendor, reviewed by the ReportPortal team.',
  },
});

/**
 * What each tier is drawn as. A tier missing from here is drawn as nothing: the registry may
 * grow a value this build has no mark for, and a mark invented on the spot would state
 * something about the plugin that nobody has claimed.
 */
const MARKS = {
  [PLUGIN_TRUST_TIERS.OFFICIAL]: {
    glyph: '✓',
    label: messages.official,
    tooltip: messages.officialTooltip,
  },
  [PLUGIN_TRUST_TIERS.PARTNER]: {
    glyph: 'P',
    label: messages.partner,
    tooltip: messages.partnerTooltip,
  },
};

/**
 * Who stands behind a plugin, beside its name.
 *
 * <p>A 16px mark rather than a pill, which is what keeps it a second axis: the pill beside it is
 * what the plugin costs, and two pills of the same shape would read as one thing said twice.
 * The sentence the design puts in a tooltip is the mark's title, so the mark is never the only
 * account of itself.
 */
export const PluginTrustMark = ({ trust = null }) => {
  const { formatMessage } = useIntl();
  const mark = MARKS[trust];

  if (!mark) {
    return null;
  }

  return (
    <span
      className={cx('plugin-trust-mark', trust)}
      data-automation-id="pluginTrustMark"
      data-trust={trust}
      title={formatMessage(mark.tooltip)}
      aria-label={formatMessage(mark.label)}
    >
      {mark.glyph}
    </span>
  );
};

PluginTrustMark.propTypes = {
  /** A trust tier, or null for a plugin the registry vouches for in no way this build knows. */
  trust: PropTypes.string,
};
