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
import { Button, DownloadIcon } from '@reportportal/ui-kit';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';
import { PluginBadge, BADGE_TONES } from '../../pluginBadge';
import {
  getAuthor,
  getDescription,
  getDisplayName,
  getRowAction,
  getRowBadges,
  getRowState,
  isAvailableRow,
  ROW_ACTIONS,
  ROW_BADGES,
  ROW_STATES,
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
  };

  static defaultProps = {
    onClick: () => {},
    onRowAction: () => {},
    highlighted: false,
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

    return (
      <div
        ref={this.rowRef}
        className={cx('plugins-list-item', { highlighted: this.props.highlighted })}
        data-automation-id="pluginRow"
        data-highlighted={this.props.highlighted || undefined}
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
                    tone={BADGE_TONES_BY_ROW_BADGE[badge]}
                    data-automation-id="pluginBadge"
                    data-badge={badge}
                  >
                    {formatMessage(messages[badge])}
                  </PluginBadge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          {/* State first, and instead of the action: a plugin that is switched off has nothing
              to offer here, and the design puts the state where the action would have been. */}
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
                onClick={this.rowActionHandler(rowAction)}
              >
                {formatMessage(messages[rowAction])}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
