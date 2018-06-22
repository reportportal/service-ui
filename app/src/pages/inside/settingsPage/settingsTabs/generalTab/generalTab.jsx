import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { BigButton } from 'components/buttons/bigButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { projectConfigSelector } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { authExtensionsSelector } from 'controllers/appInfo';
import { showNotification } from 'controllers/notification';
import styles from './generalTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  projectNameLabel: {
    id: 'GeneralTab.projectNameLabel',
    defaultMessage: 'Name',
  },
  interruptedJob: {
    id: 'GeneralTab.interruptedJob',
    defaultMessage: 'Launch inactivity timeout',
  },
  interruptedJobDescription: {
    id: 'GeneralTab.interruptedJobDescription',
    defaultMessage: 'Schedule time for Job to interrupt inactive launches',
  },
  keepLogs: {
    id: 'GeneralTab.keepLogs',
    defaultMessage: 'Keep logs',
  },
  keepLogsDescription: {
    id: 'GeneralTab.keepLogsDescription',
    defaultMessage:
      'How long to keep old logs in launches. Related launches structure will be saved, in order to keep statistics',
  },
  keepScreenshots: {
    id: 'GeneralTab.keepScreenshots',
    defaultMessage: 'Keep attachments',
  },
  keepScreenshotsDescription: {
    id: 'GeneralTab.keepScreenshotsDescription',
    defaultMessage: 'How long to keep attachments in system',
  },
  updateSuccessNotification: {
    id: 'GeneralTab.updateSuccessNotification',
    defaultMessage: 'Project settings were successfully updated',
  },
  updateErrorNotification: {
    id: 'GeneralTab.updateErrorNotification',
    defaultMessage: 'Failed to update project settings',
  },
  hour1: {
    id: 'GeneralTab.hour1',
    defaultMessage: '1 hour',
  },
  hour3: {
    id: 'GeneralTab.hour3',
    defaultMessage: '3 hours',
  },
  hour6: {
    id: 'GeneralTab.hour6',
    defaultMessage: '6 hours',
  },
  hour12: {
    id: 'GeneralTab.hour12',
    defaultMessage: '12 hours',
  },
  day1: {
    id: 'GeneralTab.day1',
    defaultMessage: '1 day',
  },
  week1: {
    id: 'GeneralTab.week1',
    defaultMessage: '1 week',
  },
  week2: {
    id: 'GeneralTab.week2',
    defaultMessage: '2 weeks',
  },
  week3: {
    id: 'GeneralTab.week3',
    defaultMessage: '3 weeks',
  },
  month1: {
    id: 'GeneralTab.month1',
    defaultMessage: '1 month',
  },
  month3: {
    id: 'GeneralTab.month3',
    defaultMessage: '3 months',
  },
  month6: {
    id: 'GeneralTab.month6',
    defaultMessage: '6 months',
  },
  forever: {
    id: 'GeneralTab.forever',
    defaultMessage: 'Forever',
  },
});

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
  }),
  {
    showNotification,
  },
)
@injectIntl
export class GeneralTab extends PureComponent {
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
    const dataToSend = {
      configuration: {
        ...data,
      },
    };
    fetch(URLS.project(this.props.projectId), { method: 'put', data: dataToSend })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateSuccessNotification),
          type: 'success',
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateErrorNotification),
          type: 'error',
        });
      });
  };

  filterOptions = (options) =>
    this.props.isEpamInstance ? options.filter((item) => item.value !== 'forever') : options;

  interruptedJob = [
    { label: this.props.intl.formatMessage(messages.hour1), value: '1 hour' },
    { label: this.props.intl.formatMessage(messages.hour3), value: '3 hours' },
    { label: this.props.intl.formatMessage(messages.hour6), value: '6 hours' },
    { label: this.props.intl.formatMessage(messages.hour12), value: '12 hours' },
    { label: this.props.intl.formatMessage(messages.day1), value: '1 day' },
    { label: this.props.intl.formatMessage(messages.week1), value: '1 week' },
  ];
  keepLogs = [
    { label: this.props.intl.formatMessage(messages.week2), value: '2 weeks' },
    { label: this.props.intl.formatMessage(messages.month1), value: '1 month' },
    { label: this.props.intl.formatMessage(messages.month3), value: '3 months' },
    { label: this.props.intl.formatMessage(messages.month6), value: '6 months' },
    { label: this.props.intl.formatMessage(messages.forever), value: 'forever' },
  ];
  keepScreenshots = [
    { label: this.props.intl.formatMessage(messages.week1), value: '1 week' },
    { label: this.props.intl.formatMessage(messages.week2), value: '2 weeks' },
    { label: this.props.intl.formatMessage(messages.week3), value: '3 weeks' },
    { label: this.props.intl.formatMessage(messages.month1), value: '1 month' },
    { label: this.props.intl.formatMessage(messages.month3), value: '3 months' },
    { label: this.props.intl.formatMessage(messages.forever), value: 'forever' },
  ];

  render() {
    const { intl } = this.props;
    return (
      <div className={cx('settings-tab-content')}>
        <form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>
              {intl.formatMessage(messages.projectNameLabel)}
            </span>
            <div className={cx('field-input')}>
              <Input disabled value={this.props.projectId} />
            </div>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>{intl.formatMessage(messages.interruptedJob)}</span>
            <div className={cx('field-input')}>
              <FieldProvider name="interruptedJob">
                <InputDropdown
                  options={this.interruptedJob}
                  customClass={cx('mobile-input-disabled')}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(messages.interruptedJobDescription)}
            </p>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>{intl.formatMessage(messages.keepLogs)}</span>
            <div className={cx('field-input')}>
              <FieldProvider name="keepLogs">
                <InputDropdown
                  options={this.filterOptions(this.keepLogs)}
                  customClass={cx('mobile-input-disabled')}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(messages.keepLogsDescription)}
            </p>
          </div>
          <div className={cx('field-container')}>
            <span className={cx('field-label')}>
              {intl.formatMessage(messages.keepScreenshots)}
            </span>
            <div className={cx('field-input')}>
              <FieldProvider name="keepScreenshots">
                <InputDropdown
                  options={this.filterOptions(this.keepScreenshots)}
                  customClass={cx('mobile-input-disabled')}
                />
              </FieldProvider>
            </div>
            <p className={cx('field-description')}>
              {intl.formatMessage(messages.keepScreenshotsDescription)}
            </p>
          </div>
          <div className={cx('button-container')}>
            <div className={cx('submit-button')}>
              <BigButton color="booger" type="submit">
                {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
              </BigButton>
            </div>
          </div>
          <div className={cx('mobile-disabling-cover')} />
        </form>
      </div>
    );
  }
}
