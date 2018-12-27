import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { BTS } from 'common/constants/settingsTabs';
import { UPDATE_BTS, CREATE_BTS, DELETE_BTS } from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
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
    const {
      activity,
      intl: { formatMessage },
    } = this.props;
    const bts = this.btsName(activity.name);
    const linksParams = {
      target: '_blank',
      to: getProjectSettingTabPageLink(activity.projectRef, BTS),
      className: cx('link'),
    };
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {`${messages[activity.actionType] && formatMessage(messages[activity.actionType])} ${
          bts.type
        }`}
        {activity.actionType === UPDATE_BTS && (
          <Fragment>
            {` ${bts.name}`}
            <Link {...linksParams}>{formatMessage(messages.properties)}.</Link>
          </Fragment>
        )}
        {activity.actionType === CREATE_BTS && <Link {...linksParams}>{bts.name}.</Link>}
        {activity.actionType === DELETE_BTS && (
          <Fragment>
            <Link {...linksParams}>{bts.name}</Link>
            {formatMessage(messages.fromProject)}.
          </Fragment>
        )}
      </Fragment>
    );
  }
}
