import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { canConfigreEmailNotifications } from 'common/utils/permissions';
import {
  updateProjectNotificationsConfigAction,
  projectNotificationsCasesSelector,
  projectNotificationsEnabledSelector,
} from 'controllers/project';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { NotificationsEnableForm } from './notificationsEnableForm';
import { NotificationCaseList } from './notificationCaseList';
import { NoCasesBlock } from './noCasesBlock';
import styles from './notificationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    enabled: projectNotificationsEnabledSelector(state),
    cases: projectNotificationsCasesSelector(state),
  }),
  { updateNotificationsConfig: updateProjectNotificationsConfigAction },
)
export class NotificationsTab extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    cases: PropTypes.array,
    updateNotificationsConfig: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
  };
  static defaultProps = {
    enabled: false,
    cases: [],
    updateNotificationsConfig: () => {},
    projectRole: '',
    userRole: '',
  };

  isAbleToEditForm = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole);

  toggleNotificationsEnabled = ({ enabled } = {}, dispatch, formProps) =>
    formProps.dirty && this.props.updateNotificationsConfig({ enabled });

  render() {
    const { enabled, cases, updateNotificationsConfig } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('notifications-tab')}>
        {cases.length ? (
          <Fragment>
            <NotificationsEnableForm
              initialValues={{ enabled }}
              onChange={this.toggleNotificationsEnabled}
              readOnly={readOnly}
            />
            <NotificationCaseList
              updateNotificationCases={updateNotificationsConfig}
              cases={cases}
              readOnly={readOnly}
            />
          </Fragment>
        ) : (
          <NoCasesBlock readOnly={readOnly} updateNotificationCases={updateNotificationsConfig} />
        )}
      </div>
    );
  }
}
