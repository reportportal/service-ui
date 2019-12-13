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
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import {
  NOTIFICATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import {
  getPluginItemClickEvent,
  getDisablePluginItemClickEvent,
} from 'components/main/analytics/events';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './pluginsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  titleBts: {
    id: 'PluginItem.titleBts',
    defaultMessage:
      'will be hidden on project settings. RP users won`t be able to post or link issue in BTS',
  },
  titleNotification: {
    id: 'PluginItem.titleNotification',
    defaultMessage:
      'will be hidden on project settings. RP users won`t be able to receive notification about test results',
  },
  titleOthers: {
    id: 'PluginItem.titleOthers',
    defaultMessage: 'will be hidden on project settings',
  },
  titleVersion: {
    id: 'PluginItem.titleVersion',
    defaultMessage: '{version}',
  },
});

const titleMessagesMap = {
  [BTS_GROUP_TYPE]: messages.titleBts,
  [NOTIFICATION_GROUP_TYPE]: messages.titleNotification,
  [OTHER_GROUP_TYPE]: messages.titleOthers,
  [AUTHORIZATION_GROUP_TYPE]: messages.titleOthers,
  [ANALYZER_GROUP_TYPE]: messages.titleOthers,
};

const maxVersionLengthForTitle = 17;

@injectIntl
@track()
export class PluginsItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    onToggleActive: PropTypes.func.isRequired,
    showNotification: PropTypes.func,
    onClick: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
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
    } = this.props;

    return (
      <div
        className={cx('plugins-list-item')}
        onClick={this.itemClickHandler}
        title={
          !enabled
            ? `${INTEGRATION_NAMES_TITLES[name] || name} ${formatMessage(
                titleMessagesMap[groupType],
              )}`
            : ''
        }
      >
        <div className={cx('plugins-info-block')}>
          <img className={cx('plugins-image')} src={INTEGRATIONS_IMAGES_MAP[name]} alt={name} />
          <div className={cx('plugins-info')}>
            <span className={cx('plugins-name')}>{INTEGRATION_NAMES_TITLES[name] || name}</span>
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
          <div className={cx('plugins-switcher')} onClick={(e) => e.stopPropagation()}>
            <InputSwitcher value={this.state.isEnabled} onChange={this.onToggleActiveHandler} />
          </div>
        </div>
      </div>
    );
  }
}
