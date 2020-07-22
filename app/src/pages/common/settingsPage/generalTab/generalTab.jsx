/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import moment from 'moment';
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
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { langSelector } from 'controllers/lang';
import styles from './generalTab.scss';
import { Messages } from './generalTabMessages';

const cx = classNames.bind(styles);

const hoursToSeconds = (hours) => moment.duration(hours, 'hours').asSeconds();
const daysToSeconds = (days) => moment.duration(days, 'days').asSeconds();
const secondsToDays = (seconds, locale) =>
  moment
    .duration(seconds, 'seconds')
    .locale(locale)
    .humanize({ d: Number.MAX_SAFE_INTEGER });

@reduxForm({
  form: 'generalForm',
})
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    jobConfig: jobAttributesSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
    lang: langSelector(state),
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
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    jobConfig: PropTypes.shape({
      interruptJobTime: PropTypes.string.isRequired,
      keepLogs: PropTypes.string.isRequired,
      keepScreenshots: PropTypes.string.isRequired,
      keepLaunches: PropTypes.string.isRequired,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    updateConfigurationAttributesAction: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    lang: PropTypes.string,
  };

  static defaultProps = {
    projectId: '',
    fetchProjectAction: () => {},
    lang: 'en',
  };

  componentDidMount() {
    const { interruptJobTime, keepLogs, keepScreenshots, keepLaunches } = this.props.jobConfig;
    this.props.initialize({
      interruptJobTime: Number(interruptJobTime),
      keepLaunches: Number(keepLaunches),
      keepLogs: Number(keepLogs),
      keepScreenshots: Number(keepScreenshots),
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

  retentionOptions = [
    { label: this.props.intl.formatMessage(Messages.week1), value: daysToSeconds(7) },
    { label: this.props.intl.formatMessage(Messages.week2), value: daysToSeconds(14) },
    { label: this.props.intl.formatMessage(Messages.week3), value: daysToSeconds(21) },
    { label: this.props.intl.formatMessage(Messages.month1), value: daysToSeconds(30) },
    { label: this.props.intl.formatMessage(Messages.month3), value: daysToSeconds(90) },
    { label: this.props.intl.formatMessage(Messages.month6), value: daysToSeconds(180) },
    { label: this.props.intl.formatMessage(Messages.forever), value: 0 },
  ];

  interruptJobTime = [
    { label: this.props.intl.formatMessage(Messages.hour1), value: hoursToSeconds(1) },
    { label: this.props.intl.formatMessage(Messages.hour3), value: hoursToSeconds(3) },
    { label: this.props.intl.formatMessage(Messages.hour6), value: hoursToSeconds(6) },
    { label: this.props.intl.formatMessage(Messages.hour12), value: hoursToSeconds(12) },
    { label: this.props.intl.formatMessage(Messages.day1), value: daysToSeconds(1) },
    { label: this.props.intl.formatMessage(Messages.week1), value: daysToSeconds(7) },
  ];

  createValueFormatter = (values) => (value) => {
    const selectedOption = values.find((option) => option.value === value);
    if (selectedOption) {
      return selectedOption;
    }
    return { label: secondsToDays(value, this.props.lang), value };
  };

  formatRetention = this.createValueFormatter(this.retentionOptions);

  formatInterruptJobTimes = this.createValueFormatter(this.interruptJobTime);

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
            format={this.formatInterruptJobTimes}
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
            format={this.formatRetention}
          >
            <InputDropdown options={this.retentionOptions} mobileDisabled />
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
            format={this.formatRetention}
          >
            <InputDropdown options={this.retentionOptions} mobileDisabled />
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
            format={this.formatRetention}
          >
            <InputDropdown options={this.retentionOptions} mobileDisabled />
          </FormField>
          <FormField withoutProvider fieldWrapperClassName={cx('button-container')}>
            <div className={cx('submit-button')}>
              <BigButton
                color="booger"
                type="submit"
                disabled={!canUpdateSettings(accountRole, userRole)}
              >
                {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
              </BigButton>
            </div>
          </FormField>
        </form>
      </div>
    );
  }
}
