import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateProjectNotificationsIntegrationAction,
  notificationRulesSelector,
  notificationIntegrationSelector,
} from 'controllers/project';
import { OWNER } from 'common/constants/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import classNames from 'classnames/bind';
import { canConfigreEmailNotifications } from 'common/utils/permissions';
import { NotificationsEnableForm, NotificationRuleForm } from './forms';
import styles from './notificationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    enabled: notificationIntegrationSelector(state).enabled,
    rules: notificationRulesSelector(state),
  }),
  { update: updateProjectNotificationsIntegrationAction },
)
export class NotificationsTab extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    rules: PropTypes.array,
    update: PropTypes.func,
    onSubmit: PropTypes.func,
    showModal: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
  };
  static defaultProps = {
    enabled: false,
    rules: [],
    update: () => {},
    onSubmit: () => {},
    showModal: () => {},
    projectRole: '',
    userRole: '',
  };

  submitForm = (values = {}, dispatch, formProps) => {
    const { update, enabled, rules } = this.props;
    const projectEmailConfig = { enabled, rules };
    const { valid, dirty } = formProps;
    const config = { ...projectEmailConfig, ...values };
    const isAbleToSubmit = this.isAbleToSubmit(config);
    const newConfig = this.prepareData(config);

    if (isAbleToSubmit && dirty && valid) {
      update(newConfig);
    }
  };

  isAbleToEditForm = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole);

  isAbleToSubmit = ({ rules }) => rules.every(({ confirmed }) => confirmed);

  convertRulesForSubmission = (obj) => {
    const {
      informOwner,
      recipients,
      launchStatsRule,
      fromAddress,
      launchNameRule = [],
      launchTagRule = [],
    } = obj;
    return {
      fromAddress,
      launchNameRule,
      launchStatsRule,
      launchTagRule,
      recipients: informOwner ? [...recipients, OWNER] : recipients,
    };
  };

  prepareData(config) {
    const rules = config.rules.map(this.convertRulesForSubmission);

    return { ...config, rules };
  }

  render() {
    const { enabled } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('notifications-tab')}>
        <NotificationsEnableForm
          initialValues={{ enabled }}
          enableReinitialize
          onChange={this.submitForm}
          readOnly={readOnly}
        />

        {enabled && (
          <NotificationRuleForm onChange={this.submitForm} readOnly={readOnly} enableReinitialize />
        )}
      </div>
    );
  }
}
