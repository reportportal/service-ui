import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateProjectEmailConfig,
  projectEmailCasesSelector,
  projectEmailEnabledSelector,
} from 'controllers/project';
import { OWNER } from 'common/constants/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import classNames from 'classnames/bind';
import { canConfigreEmailNotifications } from 'common/utils/permissions';
import { EmailEnableForm, EmailCaseForm } from './forms';
import styles from './notificationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    projectEmailConfig: {
      emailEnabled: projectEmailEnabledSelector(state),
      emailCases: projectEmailCasesSelector(state),
    },
  }),
  { update: updateProjectEmailConfig },
)
export class NotificationsTab extends Component {
  static propTypes = {
    projectEmailConfig: PropTypes.object,
    emailEnabled: PropTypes.object,
    update: PropTypes.func,
    onSubmit: PropTypes.func,
    showModal: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
  };
  static defaultProps = {
    projectEmailConfig: {},
    emailEnabled: {},
    update: () => {},
    onSubmit: () => {},
    showModal: () => {},
    projectRole: '',
    userRole: '',
  };
  submitForm = (values = {}, dispatch, formProps) => {
    const { update, projectEmailConfig } = this.props;
    const { valid, dirty } = formProps;
    const config = { ...projectEmailConfig, ...values };
    const isAbleToSubmit = this.isAbleToSubmit(config);
    const newConfig = this.formData(config);

    if (isAbleToSubmit && dirty && valid) {
      update(newConfig);
    }
  };
  isAbleToEditForm = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole);
  isAbleToSubmit = ({ emailCases }) => emailCases.every(({ confirmed }) => confirmed);
  convertEmailCasesForSubmission = (obj) => {
    const { informOwner, launchNames, recipients, sendCase, tags } = obj;
    return {
      launchNames,
      sendCase,
      tags,
      recipients: informOwner ? [...recipients, OWNER] : recipients,
    };
  };
  formData(config) {
    const emailCases = config.emailCases.map(this.convertEmailCasesForSubmission);

    return { ...config, emailCases };
  }
  render() {
    const {
      projectEmailConfig: { emailEnabled },
    } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('notification-form')}>
        <EmailEnableForm
          initialValues={{ emailEnabled }}
          onSubmit={this.submitForm}
          readOnly={readOnly}
        />

        {emailEnabled && <EmailCaseForm onChange={this.submitForm} readOnly={readOnly} />}
      </div>
    );
  }
}
