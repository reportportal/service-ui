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
import track from 'react-tracking';
import {
  getPluginItemClickEvent,
  getDisablePluginItemClickEvent,
} from 'components/main/analytics/events';
import { PLUGIN_IMAGES_MAP, PLUGIN_NAME_TITLES } from 'components/integrations';
import { PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE } from 'components/integrations/messages';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './pluginsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  titleVersion: {
    id: 'PluginItem.titleVersion',
    defaultMessage: '{version}',
  },
});

const maxVersionLengthForTitle = 17;

@injectIntl
@track()
export class PluginsItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onToggleActive: PropTypes.func.isRequired,
    toggleable: PropTypes.bool,
    showNotification: PropTypes.func,
    onClick: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    toggleable: true,
    showNotification: () => {},
    onClick: () => {},
  };

  state = {
    isEnabled: this.props.data.enabled,
  };

  onToggleActiveHandler = () => {
    const { data, onToggleActive, tracking } = this.props;
    const isEnabled = !data.enabled;
    this.setState({
      isEnabled,
    });

    if (!isEnabled) {
      tracking.trackEvent(getDisablePluginItemClickEvent(data.name));
    }

    onToggleActive(data).catch(() => {
      this.setState({
        isEnabled: data.enabled,
      });
    });
  };

  itemClickHandler = () => {
    this.props.tracking.trackEvent(getPluginItemClickEvent(this.props.data.name));
    this.props.onClick(this.props.data);
  };

  render() {
    const {
      intl: { formatMessage },
      data: { name, uploadedBy, enabled, groupType, details: { version } = {} },
      toggleable,
    } = this.props;
    const pluginName = PLUGIN_NAME_TITLES[name] || name;

    return (
      <div
        className={cx('plugins-list-item')}
        onClick={this.itemClickHandler}
        title={
          enabled
            ? ''
            : formatMessage(PLUGIN_DISABLED_MESSAGES_BY_GROUP_TYPE[groupType], { name: pluginName })
        }
      >
        <div className={cx('plugins-info-block')}>
          <img className={cx('plugins-image')} src={PLUGIN_IMAGES_MAP[name]} alt={pluginName} />
          <div className={cx('plugins-info')}>
            <span className={cx('plugins-name')}>{pluginName}</span>
            <span className={cx('plugins-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
            <span
              className={cx('plugins-version')}
              title={
                version && version.length > maxVersionLengthForTitle
                  ? formatMessage(messages.titleVersion, { version })
                  : ''
              }
            >{`${version || ''}`}</span>
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          {toggleable && (
            <div className={cx('plugins-switcher')} onClick={(e) => e.stopPropagation()}>
              <InputSwitcher value={this.state.isEnabled} onChange={this.onToggleActiveHandler} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
