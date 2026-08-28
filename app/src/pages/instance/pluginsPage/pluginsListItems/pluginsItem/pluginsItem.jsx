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
import Parser from 'html-react-parser';
import { Button } from '@reportportal/ui-kit';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import DownloadIcon from 'common/img/download-inline.svg';
import { PLUGIN_TIERS } from '../../availablePluginsCatalog';
import {
  getRowAction,
  getRowBadges,
  isAvailableRow,
  ROW_ACTIONS,
  ROW_BADGES,
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
});

// The ui-kit calls the bordered variant `ghost` and the borderless one `text`; the spec calls
// them `outline` and `ghost`. Update is the bordered one, Discover Premium the borderless one.
const ACTION_VARIANTS = {
  [ROW_ACTIONS.INSTALL]: 'primary',
  [ROW_ACTIONS.UPDATE]: 'ghost',
  [ROW_ACTIONS.DISCOVER_PREMIUM]: 'text',
};

const maxVersionLengthForTitle = 17;

@injectIntl
export class PluginsItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onToggleActive: PropTypes.func,
    showToggleConfirmationModal: PropTypes.func,
    toggleable: PropTypes.bool,
    onClick: PropTypes.func,
    onRowAction: PropTypes.func,
  };

  static defaultProps = {
    onToggleActive: () => Promise.resolve(),
    showToggleConfirmationModal: () => {},
    toggleable: true,
    onClick: () => {},
    onRowAction: () => {},
  };

  state = {
    isEnabled: this.props.data.enabled,
  };

  toggleActiveHandler = () => {
    const { data, onToggleActive } = this.props;
    const isEnabled = !data.enabled;
    this.setState({
      isEnabled,
    });

    onToggleActive(data).catch(() => {
      this.setState({
        isEnabled: data.enabled,
      });
    });
  };

  itemClickHandler = () => {
    this.props.onClick(this.props.data);
  };

  rowActionHandler = (action) => (event) => {
    event.stopPropagation();
    this.props.onRowAction(action, this.props.data);
  };

  onChangeHandler = () => {
    const {
      data: { name, enabled, details: { name: detailsName, pluginLocation } = {} },
      showToggleConfirmationModal,
    } = this.props;
    const displayName = detailsName || name;

    showToggleConfirmationModal(
      enabled,
      displayName,
      this.toggleActiveHandler,
      pluginLocation,
      name,
    );
  };

  render() {
    const {
      intl: { formatMessage },
      data: {
        name,
        uploadedBy,
        enabled,
        groupType,
        tier,
        details: { name: detailsName, version, disabledPluginTooltip } = {},
      },
      toggleable,
      data,
    } = this.props;
    const displayName = detailsName || name;
    const isInAvailablePluginList = isAvailableRow(data);
    const badges = getRowBadges(data);
    const rowAction = getRowAction(data);

    return (
      <div
        className={cx('plugins-list-item')}
        data-automation-id="pluginRow"
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
              <span className={cx('plugins-author')}>{`by ${uploadedBy || 'ReportPortal'}`}</span>
              <span
                className={cx('plugins-version')}
                title={
                  version && version.length > maxVersionLengthForTitle
                    ? formatMessage(messages.titleVersion, { version })
                    : ''
                }
              >{`${version || ''}`}</span>
            </div>
            {isInAvailablePluginList && (
              <span
                className={cx('plugins-tier', { premium: tier === PLUGIN_TIERS.PREMIUM })}
                data-automation-id="pluginBadge"
                data-badge={tier}
              >
                {formatMessage(tier === PLUGIN_TIERS.PREMIUM ? messages.premium : messages.free)}
              </span>
            )}
            {badges.map((badge) => (
              <span
                key={badge}
                className={cx('plugins-badge', `badge-${badge.toLowerCase()}`)}
                data-automation-id="pluginBadge"
                data-badge={badge}
              >
                {formatMessage(messages[badge])}
              </span>
            ))}
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          {rowAction && (
            <div
              className={cx('plugins-row-action')}
              data-automation-id="pluginRowAction"
              data-action={rowAction}
            >
              <Button
                variant={ACTION_VARIANTS[rowAction]}
                icon={rowAction === ROW_ACTIONS.UPDATE ? Parser(DownloadIcon) : null}
                onClick={this.rowActionHandler(rowAction)}
              >
                {formatMessage(messages[rowAction])}
              </Button>
            </div>
          )}
          {/* the toggle reads local state, so it survives an unreachable registry */}
          {toggleable && !isInAvailablePluginList && (
            <button className={cx('plugins-switcher')} onClick={(e) => e.stopPropagation()}>
              <InputSwitcher value={this.state.isEnabled} onChange={this.onChangeHandler} />
            </button>
          )}
        </div>
      </div>
    );
  }
}
