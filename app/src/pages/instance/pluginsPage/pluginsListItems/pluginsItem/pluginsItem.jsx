/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, DownloadIcon, SpinLoader, WarningIcon } from '@reportportal/ui-kit';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';
import { PluginBadge, BADGE_TONES } from '../../pluginBadge';
import { PluginTrustMark } from '../../pluginTrustMark';
import {
  getAuthor,
  getDescription,
  getDisplayName,
  getRowAction,
  getRowBadges,
  getRowAdvisorySeverity,
  getRowIncompatibility,
  getRowInstallState,
  getRowState,
  isAvailableRow,
  ROW_ACTIONS,
  ROW_BADGES,
  ROW_INSTALL_STATES,
  ROW_STATES,
  isSevereAdvisory,
} from '../../pluginsCatalog/utils';
import styles from './pluginsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  titleVersion: {
    id: 'PluginItem.titleVersion',
    defaultMessage: '{version}',
  },
  free: {
    id: 'PluginItem.free',
    defaultMessage: 'Free',
  },
  premium: {
    id: 'PluginItem.premium',
    defaultMessage: 'Premium',
  },
  [ROW_ACTIONS.INSTALL]: {
    id: 'PluginItem.install',
    defaultMessage: 'Install',
  },
  [ROW_ACTIONS.UPDATE]: {
    id: 'PluginItem.update',
    defaultMessage: 'Update',
  },
  [ROW_ACTIONS.DISCOVER_PREMIUM]: {
    id: 'PluginItem.discoverPremium',
    defaultMessage: 'Discover Premium',
  },
  [ROW_BADGES.ADVISORY]: {
    id: 'PluginItem.advisoryBadge',
    defaultMessage: 'Advisory',
  },
  advisoryBadgeWithSeverity: {
    id: 'PluginItem.advisoryBadgeWithSeverity',
    defaultMessage: 'Advisory — {severity}',
  },
  [ROW_BADGES.BLOCKED]: {
    id: 'PluginItem.blockedBadge',
    defaultMessage: 'Blocked',
  },
  [ROW_BADGES.REMOVED]: {
    id: 'PluginItem.removedBadge',
    defaultMessage: 'Removed from registry',
  },
  [ROW_STATES.DISABLED]: {
    id: 'PluginItem.disabledState',
    defaultMessage: 'Disabled',
  },
  [ROW_INSTALL_STATES.INSTALLING]: {
    id: 'PluginItem.installingState',
    defaultMessage: 'Installing…',
  },
  [ROW_INSTALL_STATES.FAILED]: {
    id: 'PluginItem.installFailedState',
    defaultMessage: 'Install failed',
  },
  incompatible: {
    id: 'PluginItem.incompatible',
    defaultMessage: 'Needs ReportPortal {requires}. This instance runs {productVersion}.',
  },
  incompatibleNoRelease: {
    id: 'PluginItem.incompatibleNoRelease',
    defaultMessage: "This version doesn't run on the release this instance uses.",
  },
  updateWithheld: {
    id: 'PluginItem.updateWithheld',
    defaultMessage:
      'Version {version} is available but needs ReportPortal {requires}. This instance runs'
      + ' {productVersion}.',
  },
  updateWithheldNoRelease: {
    id: 'PluginItem.updateWithheldNoRelease',
    defaultMessage: "Version {version} is available but doesn't run on the release this instance uses.",
  },
});

// The ui-kit calls the bordered variant `ghost` and the borderless one `text`; the spec calls
// them `outline` and `ghost`. Update is the bordered one, Discover Premium the borderless one.
const ACTION_VARIANTS = {
  [ROW_ACTIONS.INSTALL]: 'primary',
  [ROW_ACTIONS.UPDATE]: 'ghost',
  [ROW_ACTIONS.DISCOVER_PREMIUM]: 'text',
};

// A marketplace signal is a warning or worse; the tier is neither.
const BADGE_TONES_BY_ROW_BADGE = {
  [ROW_BADGES.ADVISORY]: BADGE_TONES.WARNING,
  [ROW_BADGES.BLOCKED]: BADGE_TONES.DANGER,
  [ROW_BADGES.REMOVED]: BADGE_TONES.DANGER,
};

/**
 * The advisory badge takes its tone from the severity the registry published. A `critical` and a
 * `low` advisory used to be the same amber pill, because the row read the advisory object as a
 * boolean — and a list is exactly where that costs something, since it is where an admin decides
 * which plugin to open first.
 */
const advisoryTone = (severity) =>
  isSevereAdvisory(severity) ? BADGE_TONES.DANGER : BADGE_TONES.WARNING;

const maxVersionLengthForTitle = 17;

@injectIntl
export class PluginsItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    onRowAction: PropTypes.func,
    /** This row is where the plugin just installed ended up. */
    highlighted: PropTypes.bool,
    /** The ReportPortal release this instance reports, quoted when explaining a refusal. */
    productVersion: PropTypes.string,
  };

  static defaultProps = {
    onClick: () => {},
    onRowAction: () => {},
    highlighted: false,
    productVersion: null,
  };

  rowRef = React.createRef();

  // A row that arrived below the fold is a row nobody sees change colour. Scrolled only when it
  // is actually out of view, so a highlight on a row already on screen does not yank the page.
  componentDidMount() {
    if (this.props.highlighted) {
      this.scrollIntoViewIfNeeded();
    }
  }

  componentDidUpdate(previous) {
    if (this.props.highlighted && !previous.highlighted) {
      this.scrollIntoViewIfNeeded();
    }
  }

  scrollIntoViewIfNeeded = () => {
    const node = this.rowRef.current;
    if (!node || typeof node.getBoundingClientRect !== 'function') {
      return;
    }
    const { top, bottom } = node.getBoundingClientRect();
    const visible = top >= 0 && bottom <= (window.innerHeight || 0);
    if (!visible && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  itemClickHandler = () => {
    this.props.onClick(this.props.data);
  };

  /**
   * Why the row will not offer the build. The wording splits on whether anything newer exists:
   * with a newer version the sentence is about an update being held back, and without one it is
   * about the plugin this instance is already running having fallen out of range.
   */
  incompatibilityReason = ({ version, requires, newer }) => {
    const { formatMessage } = this.props.intl;
    const { productVersion } = this.props;

    if (newer) {
      return requires && productVersion
        ? formatMessage(messages.updateWithheld, { version, requires, productVersion })
        : formatMessage(messages.updateWithheldNoRelease, { version });
    }

    return requires && productVersion
      ? formatMessage(messages.incompatible, { requires, productVersion })
      : formatMessage(messages.incompatibleNoRelease);
  };

  rowActionHandler = (action) => (event) => {
    event.stopPropagation();
    this.props.onRowAction(action, this.props.data);
  };

  render() {
    const {
      intl: { formatMessage },
      data: {
        enabled,
        groupType,
        tier,
        trust,
        details: { version, disabledPluginTooltip } = {},
      },
      data,
    } = this.props;
    const displayName = getDisplayName(data);
    const description = getDescription(data);
    const author = getAuthor(data);
    const isInAvailablePluginList = isAvailableRow(data);
    const badges = getRowBadges(data);
    const rowState = getRowState(data);
    const rowAction = getRowAction(data);
    const installState = getRowInstallState(data);
    const incompatible = getRowIncompatibility(data);
    const advisorySeverity = getRowAdvisorySeverity(data);

    return (
      <div
        ref={this.rowRef}
        className={cx('plugins-list-item', { highlighted: this.props.highlighted })}
        data-automation-id="pluginRow"
        data-highlighted={this.props.highlighted || undefined}
        data-install-state={installState || undefined}
        onClick={this.itemClickHandler}
        title={
          enabled || isInAvailablePluginList
            ? ''
            : disabledPluginTooltip ||
              formatMessage(PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE[groupType], {
                name: displayName,
              })
        }
      >
        <div className={cx('plugins-info-block')}>
          <PluginIcon
            className={cx('plugins-image')}
            pluginData={this.props.data}
            alt={displayName}
          />
          <div className={cx('plugins-info')}>
            <div className={cx('plugins-info-content')}>
              <span className={cx('plugins-name')}>{displayName}</span>
              {/* Who wrote it, which is a different question from what it costs: the badge below
                  answers the second one, and an installed row has an answer to this one even
                  though it has no badge. */}
              <PluginTrustMark trust={trust} />
              {/* absent rather than guessed: the old `|| 'ReportPortal'` fallback signed every
                  third-party plugin in the catalogue with the wrong name */}
              {author && <span className={cx('plugins-author')}>{`by ${author}`}</span>}
              <span
                className={cx('plugins-version')}
                title={
                  version && version.length > maxVersionLengthForTitle
                    ? formatMessage(messages.titleVersion, { version })
                    : ''
                }
              >{`${version || ''}`}</span>
              {/* Amber, beside the version, and it says what the build wants rather than only
                  that something is wrong: the two things a reader needs are the requirement and
                  the release they are on, and neither is anywhere else on the row. */}
              {incompatible && (
                <span
                  role="img"
                  className={cx('plugins-incompatible')}
                  data-automation-id="pluginIncompatibleMark"
                  title={this.incompatibilityReason(incompatible)}
                  aria-label={this.incompatibilityReason(incompatible)}
                >
                  <WarningIcon />
                </span>
              )}
            </div>
            {/* absent rather than blank: a row with nothing to say says nothing */}
            {description && (
              <p className={cx('plugins-description')} data-automation-id="pluginDescription">
                {description}
              </p>
            )}
            {(isInAvailablePluginList || badges.length > 0) && (
              <div className={cx('plugins-badges')}>
                {isInAvailablePluginList && (
                  <PluginBadge
                    tone={
                      tier === PLUGIN_TIERS.PREMIUM ? BADGE_TONES.PREMIUM : BADGE_TONES.FREE
                    }
                    data-automation-id="pluginBadge"
                    data-badge={tier}
                  >
                    {formatMessage(
                      tier === PLUGIN_TIERS.PREMIUM ? messages.premium : messages.free,
                    )}
                  </PluginBadge>
                )}
                {badges.map((badge) => (
                  <PluginBadge
                    key={badge}
                    tone={
                      badge === ROW_BADGES.ADVISORY
                        ? advisoryTone(advisorySeverity)
                        : BADGE_TONES_BY_ROW_BADGE[badge]
                    }
                    data-automation-id="pluginBadge"
                    data-badge={badge}
                    data-severity={badge === ROW_BADGES.ADVISORY ? advisorySeverity : undefined}
                  >
                    {badge === ROW_BADGES.ADVISORY && advisorySeverity
                      ? formatMessage(messages.advisoryBadgeWithSeverity, {
                          severity: advisorySeverity,
                        })
                      : formatMessage(messages[badge])}
                  </PluginBadge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          {/* An install of this row's own plugin takes the slot whole while it runs: it is the
              answer to what is happening here, and the button it replaces is the one that must
              not be pressed a second time. Rendered in place of that button rather than beside
              it, so there is nothing left to click. */}
          {installState === ROW_INSTALL_STATES.INSTALLING ? (
            <div className={cx('plugins-row-action')} data-automation-id="pluginRowInstalling">
              <Button
                variant={ACTION_VARIANTS[rowAction] || ACTION_VARIANTS[ROW_ACTIONS.INSTALL]}
                icon={<SpinLoader />}
                disabled
              >
                {formatMessage(messages[ROW_INSTALL_STATES.INSTALLING])}
              </Button>
            </div>
          ) : (
            <>
              {/* Beside the action, not instead of it: what the row says about a failure is
                  which plugin it happened to, and the next thing to do about it is to try
                  again. What went wrong was said when it happened, by the notification the
                  error code is classified into. */}
              {installState === ROW_INSTALL_STATES.FAILED && (
                <PluginBadge
                  tone={BADGE_TONES.DANGER}
                  data-automation-id="pluginRowInstallError"
                  data-install-state={installState}
                >
                  {formatMessage(messages[ROW_INSTALL_STATES.FAILED])}
                </PluginBadge>
              )}
              {/* State first, and instead of the action: a plugin that is switched off has
                  nothing to offer here, and the design puts the state where the action would
                  have been. */}
              {rowState && (
                <PluginBadge
                  tone={BADGE_TONES.NEUTRAL}
                  data-automation-id="pluginRowState"
                  data-state={rowState}
                >
                  {formatMessage(messages[rowState])}
                </PluginBadge>
              )}
              {!rowState && rowAction && (
                <div
                  className={cx('plugins-row-action')}
                  data-automation-id="pluginRowAction"
                  data-action={rowAction}
                >
                  <Button
                    variant={ACTION_VARIANTS[rowAction]}
                    icon={rowAction === ROW_ACTIONS.UPDATE ? <DownloadIcon /> : null}
                    // the server would refuse this install; the row says so instead of letting
                    // the user find out from the error that follows the click
                    disabled={Boolean(incompatible) && rowAction === ROW_ACTIONS.INSTALL}
                    onClick={this.rowActionHandler(rowAction)}
                  >
                    {formatMessage(messages[rowAction])}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}
