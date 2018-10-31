import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  create_dashboard: {
    id: 'CommonEntityChanges.create',
    defaultMessage: 'created dashboard',
  },
  update_dashboard: {
    id: 'CommonEntityChanges.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  delete_dashboard: {
    id: 'CommonEntityChanges.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  create_widget: {
    id: 'CommonEntityChanges.createWidget',
    defaultMessage: 'created widget',
  },
  update_widget: {
    id: 'CommonEntityChanges.updateWidget',
    defaultMessage: 'updated widget',
  },
  delete_widget: {
    id: 'CommonEntityChanges.deleteWidget',
    defaultMessage: 'deleted widget',
  },
  create_filter: {
    id: 'CommonEntityChanges.createFilter',
    defaultMessage: 'created filter',
  },
  update_filter: {
    id: 'CommonEntityChanges.updateFilter',
    defaultMessage: 'updated filter',
  },
  delete_filter: {
    id: 'CommonEntityChanges.deleteFilter',
    defaultMessage: 'deleted filter',
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
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        <span className={cx('dashboard-name')}> {activity.name}.</span>
      </Fragment>
    );
  }
}
