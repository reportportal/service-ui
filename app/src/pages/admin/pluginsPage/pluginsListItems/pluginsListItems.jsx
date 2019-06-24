import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import {
  ALL_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
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
});

@injectIntl
export class PluginsListItems extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
  };

  render() {
    const {
      intl: { formatMessage },
      title,
      items,
    } = this.props;

    return (
      <Fragment>
        <h2 className={cx('plugins-content-title')}>{formatMessage(pluginTitle[title])}</h2>
        <div className={cx('plugins-content-list')}>
          {items.map((item) => (
            <Fragment key={item.type}>
              <PluginsItem data={item} />
            </Fragment>
          ))}
        </div>
      </Fragment>
    );
  }
}
