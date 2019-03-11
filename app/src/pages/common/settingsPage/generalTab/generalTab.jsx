import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { canUpdateSettings } from 'common/utils/permissions';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { BigButton } from 'components/buttons/bigButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  updateConfigurationAttributesAction,
  jobAttributesSelector,
  normalizeAttributesWithPrefix,
  JOB_ATTRIBUTE_PREFIX,
} from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { FormField } from 'components/fields/formField';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { projectIdSelector } from 'controllers/pages';
import { authExtensionsSelector } from 'controllers/appInfo';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import styles from './generalTab.scss';
import { Messages } from './generalTabMessages';

const cx = classNames.bind(styles);

@reduxForm({
  form: 'generalForm',
})
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    jobConfig: jobAttributesSelector(state),
    isEpamInstance: !!authExtensionsSelector(state).epam,
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
  }),
  {
    showNotification,
    updateConfigurationAttributesAction,
  },
)
@injectIntl
@track()
export class GeneralTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    jobConfig: PropTypes.shape({
      interruptJobTime: PropTypes.string.isRequired,
      keepLogs: PropTypes.string.isRequired,
      keepScreenshots: PropTypes.string.isRequired,
      keepLaunches: PropTypes.string.isRequired,
    }).isRequired,
    isEpamInstance: PropTypes.bool.isRequired,
    showNotification: PropTypes.func.isRequired,
    updateConfigurationAttributesAction: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    projectId: '',
    fetchProjectAction: () => {},
  };

  componentDidMount() {
    const { interruptJobTime, keepLogs, keepScreenshots, keepLaunches } = this.props.jobConfig;
    this.props.initialize({
      interruptJobTime: interruptJobTime.toLowerCase(),
      keepLaunches: keepLaunches.toLowerCase(),
      keepLogs: keepLogs.toLowerCase(),
      keepScreenshots: keepScreenshots.toLowerCase(),
    });
  }

  onFormSubmit = (formData) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.GENERAL_SUBMIT);
    const preparedData = normalizeAttributesWithPrefix(formData, JOB_ATTRIBUTE_PREFIX);
    const data = {
      configuration: {
        attributes: {
          ...preparedData,
        },
      },
    };
    fetch(URLS.project(this.props.projectId), { method: 'put', data })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(Messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.updateConfigurationAttributesAction(data);
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

  interruptJobTime = [
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
  keepLaunches = [
    { label: this.props.intl.formatMessage(Messages.week2), value: '2 weeks' },
    { label: this.props.intl.formatMessage(Messages.month1), value: '1 month' },
    { label: this.props.intl.formatMessage(Messages.month3), value: '3 months' },
    { label: this.props.intl.formatMessage(Messages.month6), value: '6 months' },
    { label: this.props.intl.formatMessage(Messages.forever), value: 'forever' },
  ];

  render() {
    const { intl, accountRole, userRole, tracking } = this.props;
    return (
      <div className={cx('general-tab')}>
        <form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
          <FormField
            fieldWrapperClassName={cx('field-input')}
            label={intl.formatMessage(Messages.projectNameLabel)}
            withoutProvider
          >
            <Input disabled value={this.props.projectId} />
          </FormField>
          <FormField
            name="interruptJobTime"
            fieldWrapperClassName={cx('field-input')}
            label={intl.formatMessage(Messages.interruptedJob)}
            onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.INACTIVITY_TIMEOUT_GENERAL)}
            customBlock={{
              node: <p>{intl.formatMessage(Messages.interruptedJobDescription)}</p>,
            }}
            disabled={!canUpdateSettings(accountRole, userRole)}
          >
            <InputDropdown options={this.interruptJobTime} mobileDisabled />
          </FormField>
          <FormField
            name="keepLaunches"
            fieldWrapperClassName={cx('field-input')}
            label={intl.formatMessage(Messages.keepLaunches)}
            onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.INACTIVITY_TIMEOUT_GENERAL)}
            customBlock={{
              node: <p>{intl.formatMessage(Messages.keepLaunchesDescription)}</p>,
            }}
            disabled={!canUpdateSettings(accountRole, userRole)}
          >
            <InputDropdown options={this.filterOptions(this.keepLaunches)} mobileDisabled />
          </FormField>
          <FormField
            name="keepLogs"
            fieldWrapperClassName={cx('field-input')}
            label={intl.formatMessage(Messages.keepLogs)}
            onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.KEEP_LOGS_GENERAL)}
            customBlock={{
              node: <p>{intl.formatMessage(Messages.keepLogsDescription)}</p>,
            }}
            disabled={!canUpdateSettings(accountRole, userRole)}
          >
            <InputDropdown options={this.filterOptions(this.keepLogs)} mobileDisabled />
          </FormField>
          <FormField
            name="keepScreenshots"
            fieldWrapperClassName={cx('field-input')}
            label={intl.formatMessage(Messages.keepScreenshots)}
            onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.KEEP_SCREENSHOTS_GENERAL)}
            customBlock={{
              node: <p>{intl.formatMessage(Messages.keepScreenshotsDescription)}</p>,
            }}
            disabled={!canUpdateSettings(accountRole, userRole)}
          >
            <InputDropdown options={this.filterOptions(this.keepScreenshots)} mobileDisabled />
          </FormField>
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
