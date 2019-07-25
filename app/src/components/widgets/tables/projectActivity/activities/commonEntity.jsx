import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  CREATE_WIDGET,
  UPDATE_WIDGET,
  DELETE_WIDGET,
  CREATE_FILTER,
  UPDATE_FILTER,
  DELETE_FILTER,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
} from 'common/constants/actionTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'CommonEntityChanges.create',
    defaultMessage: 'created dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'CommonEntityChanges.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'CommonEntityChanges.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  [CREATE_WIDGET]: {
    id: 'CommonEntityChanges.createWidget',
    defaultMessage: 'created widget',
  },
  [UPDATE_WIDGET]: {
    id: 'CommonEntityChanges.updateWidget',
    defaultMessage: 'updated widget',
  },
  [DELETE_WIDGET]: {
    id: 'CommonEntityChanges.deleteWidget',
    defaultMessage: 'deleted widget',
  },
  [CREATE_FILTER]: {
    id: 'CommonEntityChanges.createFilter',
    defaultMessage: 'created filter',
  },
  [UPDATE_FILTER]: {
    id: 'CommonEntityChanges.updateFilter',
    defaultMessage: 'updated filter',
  },
  [DELETE_FILTER]: {
    id: 'CommonEntityChanges.deleteFilter',
    defaultMessage: 'deleted filter',
  },
  [CREATE_PATTERN]: {
    id: 'CommonEntityChanges.createPattern',
    defaultMessage: 'created pattern',
  },
  [UPDATE_PATTERN]: {
    id: 'CommonEntityChanges.updatePattern',
    defaultMessage: 'updated pattern',
  },
  [DELETE_PATTERN]: {
    id: 'CommonEntityChanges.deletePattern',
    defaultMessage: 'deleted pattern',
  },
  [MATCHED_PATTERN]: {
    id: 'CommonEntityChanges.matchedPattern',
    defaultMessage: 'matched pattern',
  },
});

@injectIntl
export class CommonEntity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  state = {
    testItem: null,
  };

  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        <span className={cx('activity-name')}> {activity.details.objectName}.</span>
      </Fragment>
    );
  }
}
