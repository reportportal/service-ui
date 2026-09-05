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
  IMPORT_GROUP_TYPE,
  AVAILABLE_PLUGINS_TYPE,
} from 'common/constants/pluginsGroupTypes';
import styles from './pluginsListItems.scss';
import { PluginsItem } from './pluginsItem/index';

const cx = classNames.bind(styles);

const pluginTitle = defineMessages({
  [AVAILABLE_PLUGINS_TYPE]: {
    id: 'PluginsList.availableToInstall',
    defaultMessage: 'Available to install',
  },
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
  [IMPORT_GROUP_TYPE]: {
    id: 'PluginsList.import',
    defaultMessage: 'Launches Import',
  },
  [OTHER_GROUP_TYPE]: {
    id: 'PluginsList.other',
    defaultMessage: 'Other',
  },
});

const messages = defineMessages({
  groupCount: {
    id: 'PluginsList.groupCount',
    defaultMessage: '({count})',
  },
});

@injectIntl
export class PluginsListItems extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onItemClick: PropTypes.func,
    onRowAction: PropTypes.func,
    filterMobileBlock: PropTypes.element,
    /** Registry id of the row to point at, if one of these is it. */
    highlightedRegistryId: PropTypes.string,
  };

  static defaultProps = {
    filterMobileBlock: null,
    highlightedRegistryId: null,
    onItemClick: () => {},
    onRowAction: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      title,
      onItemClick,
      items,
      onRowAction,
      filterMobileBlock,
      highlightedRegistryId,
    } = this.props;

    return (
      <Fragment>
        <h2 className={cx('plugins-content-title')}>
          {formatMessage(pluginTitle[title])}{' '}
          <span className={cx('plugins-content-count')} data-automation-id="pluginsGroupCount">
            {formatMessage(messages.groupCount, { count: items.length })}
          </span>
        </h2>
        {filterMobileBlock}
        <div className={cx('plugins-content-list')}>
          {items.map((item) => (
            <PluginsItem
              key={item.type || item.name}
              onClick={onItemClick}
              data={item}
              onRowAction={onRowAction}
              highlighted={Boolean(highlightedRegistryId) && item.registryId === highlightedRegistryId}
            />
          ))}
        </div>
      </Fragment>
    );
  }
}
