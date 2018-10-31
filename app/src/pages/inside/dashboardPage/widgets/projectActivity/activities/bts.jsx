import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { BTS } from 'common/constants/settingsTabs';
import { UPDATE_BTS, CREATE_BTS, DELETE_BTS } from 'common/constants/actionTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_BTS]: {
    id: 'ExternalSystems.creteBTs',
    defaultMessage: 'configured',
  },
  [UPDATE_BTS]: {
    id: 'ExternalSystems.updateBts',
    defaultMessage: 'updated',
  },
  [DELETE_BTS]: {
    id: 'ExternalSystems.deleteBts',
    defaultMessage: 'removed',
  },
  properties: {
    id: 'ExternalSystems.properties',
    defaultMessage: 'properties',
  },
  fromProject: {
    id: 'ExternalSystems.fromProject',
    defaultMessage: 'from project',
  },
});

@injectIntl
export class Bts extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  btsName = (val) => {
    const [type, name] = val.split(':');
    return { type, name: name && name !== 'null' ? name : null };
  };

  render() {
    const { activity, intl } = this.props;
    const bts = this.btsName(activity.name);
    const link = `#${activity.projectRef}/settings/${BTS}`;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        <span> {bts.type} </span>
        {activity.actionType === UPDATE_BTS && (
          <span>
            {bts.name}
            <a target="_blank" href={link} className={cx('link')}>
              {intl.formatMessage(messages.properties)}
            </a>.
          </span>
        )}
        {activity.actionType === CREATE_BTS && (
          <a target="_blank" href={link} className={cx('link')}>
            {bts.name}.
          </a>
        )}
        {activity.actionType === DELETE_BTS && (
          <span>
            <a target="_blank" href={link} className={cx('link')}>
              {bts.name}
            </a>
            {intl.formatMessage(messages.fromProject)}.
          </span>
        )}
      </Fragment>
    );
  }
}
