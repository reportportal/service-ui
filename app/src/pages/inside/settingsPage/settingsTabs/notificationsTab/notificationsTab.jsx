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
import { debounce } from 'common/utils/debounce';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { EmailEnableForm, EmailCaseForm } from './forms';
import styles from './notificationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    emailEnabled: projectEmailEnabledSelector(state),
    emailCases: projectEmailCasesSelector(state),
  }),
  { update: updateProjectEmailConfig },
)
export class NotificationsTab extends Component {
  static propTypes = {
    emailEnabled: PropTypes.bool,
    emailCases: PropTypes.array,
    update: PropTypes.func,
    onSubmit: PropTypes.func,
    showModal: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
  };
  static defaultProps = {
    emailEnabled: false,
    emailCases: [],
    update: () => {},
    onSubmit: () => {},
    showModal: () => {},
    projectRole: '',
    userRole: '',
  };
  state = {
    editable: false,
  };
  componentDidMount() {
    this.toggleReadOnlyMode();
    window.addEventListener('resize', this.toggleReadOnlyMode);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.toggleReadOnlyMode);
  }
  submitForm = (values = {}, dispatch, formProps) => {
    const { update, emailEnabled, emailCases } = this.props;
    const projectEmailConfig = { emailEnabled, emailCases };
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
  isAbleToSubmit = ({ emailCases }) =>
    emailCases.every(({ confirmed, submitted }) => submitted || confirmed);
  convertEmailCaseForSubmission = (obj) => {
    const { informOwner, launchNames, recipients, sendCase, tags } = obj;
    return {
      launchNames,
      sendCase,
      tags,
      recipients: informOwner ? [...recipients, OWNER] : recipients,
    };
  };
  prepareData(config) {
    const emailCases = config.emailCases.map(this.convertEmailCaseForSubmission);

    return { ...config, emailCases };
  }
  isOnMobile = () => window.matchMedia(SCREEN_XS_MAX).matches;
  toggleReadOnlyMode = () => {
    debounce(() => {
      this.setState({ editable: this.isAbleToEditForm() && !this.isOnMobile() });
    }, 200)();
  };
  render() {
    const { emailEnabled } = this.props;
    const { editable } = this.state;
    return (
      <div className={cx('notification-form')}>
        <EmailEnableForm
          initialValues={{ emailEnabled }}
          enableReinitialize
          onChange={this.submitForm}
          readOnly={!editable}
        />

        {emailEnabled && (
          <EmailCaseForm onChange={this.submitForm} readOnly={!editable} enableReinitialize />
        )}
      </div>
    );
  }
}
