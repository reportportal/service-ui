import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { URLS } from 'common/urls';
import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
import { canUpdateSettings } from 'common/utils/permissions';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { BigButton } from 'components/buttons/bigButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { projectConfigSelector } from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { authExtensionsSelector } from 'controllers/appInfo';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import styles from './generalTab.scss';
import { Messages } from './generalTabsMessages';

const cx = classNames.bind(styles);

@reduxForm({
  form: 'generalForm',
})
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    interruptedJob: projectConfigSelector(state).interruptedJob,
    keepLogs: projectConfigSelector(state).keepLogs,
    keepScreenshots: projectConfigSelector(state).keepScreenshots,
    isEpamInstance: !!authExtensionsSelector(state).epam,
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
    token: tokenSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
@track()
export class GeneralTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    interruptedJob: PropTypes.string.isRequired,
    keepLogs: PropTypes.string.isRequired,
    keepScreenshots: PropTypes.string.isRequired,
    isEpamInstance: PropTypes.bool.isRequired,
    showNotification: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    token: PropTypes.string.isRequired,
  };

  static defaultProps = {
    projectId: '',
    fetchProjectAction: () => {},
  };

  componentDidMount() {
    const { interruptedJob, keepLogs, keepScreenshots } = this.props;
    this.props.initialize({
      interruptedJob,
      keepLogs,
      keepScreenshots,
    });
  }

  onFormSubmit = (data) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.GENERAL_SUBMIT);
    const dataToSend = {
      configuration: {
        ...data,
      },
    };
    fetchAPI(URLS.project(this.props.projectId), this.props.token, {
      method: 'put',
      data: dataToSend,
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(Messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(Messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  filterOptions = (options) =>
    this.props.isEpamInstance ? options.filter((item) => item.value !== 'forever') : options;

  interruptedJob = [
    { label: this.props.intl.formatMessage(Messages.hour1), value: '1 hour' },
    { label: this.props.intl.formatMessage(Messages.hour3), value: '3 hours' },
    { label: this.props.intl.formatMessage(Messages.hour6), value: '6 hours' },
    { label: this.props.intl.formatMessage(Messages.hour12), value: '12 hours' },
    { label: this.props.intl.formatMessage(Messages.day1), value: '1 day' },
    { label: this.props.intl.formatMessage(Messages.week1), value: '1 week' },
  ];
  keepLogs = [
    { label: this.props.intl.formatMessage(Messages.week2), value: '2 weeks' },
    { label: this.props.intl.formatMessage(Messages.month1), value: '1 month' },
    { label: this.props.intl.formatMessage(Messages.month3), value: '3 months' },
    { label: this.props.intl.formatMessage(Messages.month6), value: '6 months' },
    { label: this.props.intl.formatMessage(Messages.forever), value: 'forever' },
  ];
  keepScreenshots = [
    { label: this.props.intl.formatMessage(Messages.week1), value: '1 week' },
    { label: this.props.intl.formatMessage(Messages.week2), value: '2 weeks' },
    { label: this.props.intl.formatMessage(Messages.week3), value: '3 weeks' },
    { label: this.props.intl.formatMessage(Messages.month1), value: '1 month' },
    { label: this.props.intl.formatMessage(Messages.month3), value: '3 months' },
    { label: this.props.intl.formatMessage(Messages.forever), value: 'forever' },
  ];

  render() {
    const { intl, accountRole, userRole, tracking } = this.props;
    return (
      <div className={cx('general-tab')}>
        <form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>
              {intl.formatMessage(Messages.projectNameLabel)}
            </span>
            <div className={cx('field-input')}>
              <Input disabled value={this.props.projectId} />
            </div>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>{intl.formatMessage(Messages.interruptedJob)}</span>
            <div className={cx('field-input')}>
              <FieldProvider
                name="interruptedJob"
                onChange={() =>
                  tracking.trackEvent(SETTINGS_PAGE_EVENTS.INACTIVITY_TIMEOUT_GENERAL)
                }
              >
                <InputDropdown
                  options={this.interruptedJob}
                  mobileDisabled
                  disabled={!canUpdateSettings(accountRole, userRole)}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(Messages.interruptedJobDescription)}
            </p>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>{intl.formatMessage(Messages.keepLogs)}</span>
            <div className={cx('field-input')}>
              <FieldProvider
                name="keepLogs"
                onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.KEEP_LOGS_GENERAL)}
              >
                <InputDropdown
                  options={this.filterOptions(this.keepLogs)}
                  mobileDisabled
                  disabled={!canUpdateSettings(accountRole, userRole)}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(Messages.keepLogsDescription)}
            </p>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>
              {intl.formatMessage(Messages.keepScreenshots)}
            </span>
            <div className={cx('field-input')}>
              <FieldProvider
                name="keepScreenshots"
                onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.KEEP_SCREENSHOTS_GENERAL)}
              >
                <InputDropdown
                  options={this.filterOptions(this.keepScreenshots)}
                  mobileDisabled
                  disabled={!canUpdateSettings(accountRole, userRole)}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(Messages.keepScreenshotsDescription)}
            </p>
          </div>
          <div className={cx('button-container')}>
            <div className={cx('submit-button')}>
              <BigButton
                color="booger"
                type="submit"
                disabled={!canUpdateSettings(accountRole, userRole)}
              >
                {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
              </BigButton>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
