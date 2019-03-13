import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { NOTIFICATION_GROUP_TYPE, BTS_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { IntegrationsListItem } from './integrationsListItem';
import styles from './integrationsList.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [BTS_GROUP_TYPE]: {
    id: 'IntegrationsList.bts',
    defaultMessage: 'Bug Tracking Systems',
  },
  [NOTIFICATION_GROUP_TYPE]: {
    id: 'IntegrationsList.notification',
    defaultMessage: 'Notifications',
  },
});

@injectIntl
export class IntegrationsList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    groupedIntegrations: PropTypes.object.isRequired,
    onItemClick: PropTypes.func,
    activeItem: PropTypes.object,
  };

  static defaultProps = {
    onItemClick: () => {},
    activeItem: {},
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      activeItem,
      groupedIntegrations,
    } = this.props;

    return (
      <div className={cx('integrations-list')}>
        {Object.keys(groupedIntegrations).map((key) => (
          <div key={key} className={cx('integrations-group')}>
            <div className={cx('integrations-group-header')}>
              {messages[key] ? formatMessage(messages[key]) : key}
              {` (${groupedIntegrations[key].length})`}
            </div>
            <div className={cx('integrations-group-items')}>
              {groupedIntegrations[key].map((item) => (
                <Fragment key={item.id}>
                  <IntegrationsListItem
                    isActive={item.integrationType.name === activeItem.name}
                    onClick={onItemClick}
                    integrationType={item.integrationType}
                  />
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
