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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import {
  ALL_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { isPluginSwitchable } from 'controllers/plugins';
import styles from './pluginsListItems.scss';
import { PluginsItem } from './pluginsItem/index';

const cx = classNames.bind(styles);

const pluginTitle = defineMessages({
  [ALL_GROUP_TYPE]: {
    id: 'PluginsList.all',
    defaultMessage: 'Installed plugins',
  },
  [BTS_GROUP_TYPE]: {
    id: 'PluginsList.bts',
    defaultMessage: 'Bug Tracking Systems',
  },
  [NOTIFICATION_GROUP_TYPE]: {
    id: 'PluginsList.notification',
    defaultMessage: 'Notifications',
  },
  [AUTHORIZATION_GROUP_TYPE]: {
    id: 'PluginsList.authorization',
    defaultMessage: 'Authorization',
  },
  [ANALYZER_GROUP_TYPE]: {
    id: 'PluginsList.analyzer',
    defaultMessage: 'Analyzer',
  },
  [OTHER_GROUP_TYPE]: {
    id: 'PluginsList.other',
    defaultMessage: 'Other',
  },
});

@injectIntl
export class PluginsListItems extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onToggleActive: PropTypes.func.isRequired,
    onItemClick: PropTypes.func,
    filterMobileBlock: PropTypes.element,
  };

  static defaultProps = {
    filterMobileBlock: null,
    onItemClick: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      title,
      onItemClick,
      items,
      onToggleActive,
      filterMobileBlock,
    } = this.props;

    return (
      <Fragment>
        <h2 className={cx('plugins-content-title')}>{formatMessage(pluginTitle[title])}</h2>
        {filterMobileBlock}
        <div className={cx('plugins-content-list')}>
          {items.map((item) => (
            <PluginsItem
              key={item.type}
              onClick={onItemClick}
              data={item}
              toggleable={isPluginSwitchable(item.name)}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </Fragment>
    );
  }
}
