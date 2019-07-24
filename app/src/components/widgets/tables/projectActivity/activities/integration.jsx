import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import {
  UPDATE_INTEGRATION,
  CREATE_INTEGRATION,
  DELETE_INTEGRATION,
} from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_INTEGRATION]: {
    id: 'ExternalSystems.createIntegration',
    defaultMessage: 'configured',
  },
  [UPDATE_INTEGRATION]: {
    id: 'ExternalSystems.updateIntegration',
    defaultMessage: 'updated',
  },
  [DELETE_INTEGRATION]: {
    id: 'ExternalSystems.deleteIntegration',
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
export class Integration extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  integrationName = (val) => {
    const [type, name] = val.split(':');
    return { type, name: name && name !== 'null' ? name : null };
  };

  render() {
    const {
      activity,
      intl: { formatMessage },
    } = this.props;
    const integration = this.integrationName(activity.details.objectName);
    const linksParams = {
      target: '_blank',
      to: getProjectSettingTabPageLink(activity.projectName, INTEGRATIONS),
      className: cx('link'),
    };
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {`${messages[activity.actionType] && formatMessage(messages[activity.actionType])} ${
          integration.type
        }`}
        {activity.actionType === UPDATE_INTEGRATION && (
          <Fragment>
            {` ${integration.name}`}
            <Link {...linksParams}>{formatMessage(messages.properties)}.</Link>
          </Fragment>
        )}
        {activity.actionType === CREATE_INTEGRATION && (
          <Link {...linksParams}>{integration.name}.</Link>
        )}
        {activity.actionType === DELETE_INTEGRATION && (
          <Fragment>
            <Link {...linksParams}>{integration.name}</Link>
            {formatMessage(messages.fromProject)}.
          </Fragment>
        )}
      </Fragment>
    );
  }
}
