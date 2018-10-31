import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { BTS } from 'common/constants/settingTabs';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  create_bts: {
    id: 'ExternalSystems.creteBTs',
    defaultMessage: 'configured',
  },
  update_bts: {
    id: 'ExternalSystems.updateBts',
    defaultMessage: 'updated',
  },
  delete_bts: {
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
    const bts = val.split(':');
    return { type: bts[0], name: bts[1] && bts[1] !== 'null' ? bts[1] : null };
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
        {activity.actionType === 'update_bts' && (
          <span>
            {bts.name}
            <a target="_blank" href={link} className={cx('link')}>
              {intl.formatMessage(messages.properties)}
            </a>.
          </span>
        )}
        {activity.actionType === 'create_bts' && (
          <a target="_blank" href={link} className={cx('link')}>
            {bts.name}.
          </a>
        )}
        {activity.actionType === 'delete_bts' && (
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
