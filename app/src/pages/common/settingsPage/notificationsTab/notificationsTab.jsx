import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { OWNER } from 'common/constants/permissions';
import { canConfigreEmailNotifications } from 'common/utils/permissions';
import {
  updateProjectNotificationsConfig,
  projectNotificationsCasesSelector,
  projectNotificationsEnabledSelector,
} from 'controllers/project';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { NotificationsEnableForm, NotificationCaseForm } from './forms';
import { defaultCase } from './forms/constants';
import styles from './notificationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    enabled: projectNotificationsEnabledSelector(state),
    cases: projectNotificationsCasesSelector(state),
  }),
  { update: updateProjectNotificationsConfig },
)
export class NotificationsTab extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    cases: PropTypes.array,
    update: PropTypes.func,
    onSubmit: PropTypes.func,
    showModal: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
  };
  static defaultProps = {
    enabled: false,
    cases: [],
    update: () => {},
    onSubmit: () => {},
    showModal: () => {},
    projectRole: '',
    userRole: '',
  };
  submitForm = (values = {}, dispatch, formProps) => {
    const { update, enabled, cases } = this.props;
    const { valid, dirty } = formProps;
    const config = { enabled, cases, ...values };
    const isDeleteAction = (cases && cases.length) > (values.cases && values.cases.length);
    const isAbleToSubmit = this.isAbleToSubmit(config);
    const newConfig = this.prepareData(config);

    if (isAbleToSubmit && dirty && (valid || isDeleteAction)) {
      update(newConfig);
    }
  };
  isAbleToEditForm = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole);

  isAbleToSubmit = ({ cases }) => cases.every(({ confirmed }) => confirmed);

  convertNotificationsCaseForSubmission = (obj) => {
    const { informOwner, recipients, sendCase, launchNames = [], attributes = [] } = obj;
    return {
      launchNames,
      sendCase,
      attributes,
      recipients: informOwner ? [...recipients, OWNER] : recipients,
    };
  };
  prepareData(config) {
    const cases = ((config.cases && config.cases.length && config.cases) || [defaultCase]).map(
      this.convertNotificationsCaseForSubmission,
    );

    return { ...config, cases };
  }
  render() {
    const { enabled, cases } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('notification-tab')}>
        <NotificationsEnableForm
          initialValues={{ enabled }}
          enableReinitialize
          onChange={this.submitForm}
          readOnly={readOnly}
        />
        {enabled && (
          <NotificationCaseForm
            initialValues={{ cases }}
            onChange={this.submitForm}
            readOnly={readOnly}
            enableReinitialize
          />
        )}
      </div>
    );
  }
}
