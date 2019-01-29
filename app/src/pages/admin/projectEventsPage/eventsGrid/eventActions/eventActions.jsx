import React, { Component } from 'react';
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
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  START_IMPORT,
  FINISH_IMPORT,
  CREATE_USER,
  UPDATE_PROJECT,
} from 'common/constants/actionTypes';
import styles from '../eventsGrid.scss';

const cx = classNames.bind(styles);

const actionMessages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'EventActions.createDashboard',
    defaultMessage: 'created dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'EventActions.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'EventActions.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  [CREATE_WIDGET]: {
    id: 'EventActions.createWidget',
    defaultMessage: 'created widget',
  },
  [UPDATE_WIDGET]: {
    id: 'EventActions.updateWidget',
    defaultMessage: 'updated widget',
  },
  [DELETE_WIDGET]: {
    id: 'EventActions.deleteWidget',
    defaultMessage: 'deleted widget',
  },
  [CREATE_FILTER]: {
    id: 'EventActions.createFilter',
    defaultMessage: 'create filter',
  },
  [UPDATE_FILTER]: {
    id: 'EventActions.updateFilter',
    defaultMessage: 'update filter',
  },
  [DELETE_FILTER]: {
    id: 'EventActions.deleteFilter',
    defaultMessage: 'delete filter',
  },
  [START_LAUNCH]: {
    id: 'EventActions.startLaunch',
    defaultMessage: 'start launch',
  },
  [FINISH_LAUNCH]: {
    id: 'EventActions.finishLaunch',
    defaultMessage: 'finish launch',
  },
  [DELETE_LAUNCH]: {
    id: 'EventActions.deleteLaunch',
    defaultMessage: 'delete launch',
  },
  [START_IMPORT]: {
    id: 'EventActions.startImport',
    defaultMessage: 'start import',
  },
  [FINISH_IMPORT]: {
    id: 'EventActions.finishImport',
    defaultMessage: 'finish import',
  },
  [CREATE_USER]: {
    id: 'EventActions.CreateUser',
    defaultMessage: 'create user',
  },
  [UPDATE_PROJECT]: {
    id: 'EventActions.updateProject',
    defaultMessage: 'update project',
  },
});
@injectIntl
export class EventActions extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    value: {},
  };

  render() {
    const { className, value, intl } = this.props;
    return (
      <div className={cx('action-col', className)}>
        {value.actionType && intl.formatMessage(actionMessages[value.actionType])}
      </div>
    );
  }
}
