/*
 * Copyright 2025 EPAM Systems
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
import isEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { formValueSelector, reduxForm } from 'redux-form';
import { BubblesLoader, Button, Dropdown } from '@reportportal/ui-kit';
import { URLS } from 'common/urls';
import {
  daysToSeconds,
  fetch,
  hoursToDays,
  hoursToSeconds,
  secondsToDays,
  secondsToHours,
} from 'common/utils';
import { canUpdateSettings } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  updateConfigurationAttributesAction,
  jobAttributesSelector,
  normalizeAttributesWithPrefix,
  JOB_ATTRIBUTE_PREFIX,
  projectInfoLoadingSelector,
  projectKeySelector,
  projectNameSelector,
} from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/pages';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { langSelector } from 'controllers/lang';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PROJECT_SETTINGS_GENERAL_TAB_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { settingsMessages } from 'common/constants/localization/settingsLocalization';
import { FieldElement } from '../content/elements';
import styles from './generalTab.scss';
import { messages } from './generalTabMessages';

const cx = classNames.bind(styles);

const selector = formValueSelector('generalForm');

const getInactivityTimeoutAnalytics = (inactivityTimeoutSeconds) => {
  const inactivityTimeoutHours = secondsToHours(inactivityTimeoutSeconds);
  const inactivityTimeoutDays = hoursToDays(inactivityTimeoutHours);

  const severalHours = inactivityTimeoutHours > 1;
  const hoursValue = `${inactivityTimeoutHours}_${severalHours ? 'hours' : 'hour'}`;

  const severalDays = inactivityTimeoutDays > 1;
  const daysValue = `${inactivityTimeoutDays}_${severalDays ? 'days' : 'day'}`;

  return inactivityTimeoutHours >= 24 ? daysValue : hoursValue;
};

const getAnalyticsData = (...periods) =>
  periods
    .map((periodInSeconds) => {
      const isForever = periodInSeconds === 0;

      if (isForever) {
        return 'forever';
      }
      const days = hoursToDays(secondsToHours(periodInSeconds));

      return days;
    })
    .join('#');

@reduxForm({
  form: 'generalForm',
})
@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
    projectName: projectNameSelector(state),
    isLoading: projectInfoLoadingSelector(state),
    jobConfig: jobAttributesSelector(state),
    userRoles: userRolesSelector(state),
    lang: langSelector(state),
    formValues: selector(state, 'keepLaunches', 'keepLogs', 'keepScreenshots'),
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
    projectKey: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    jobConfig: PropTypes.shape({
      interruptJobTime: PropTypes.string.isRequired,
      keepLogs: PropTypes.string.isRequired,
      keepScreenshots: PropTypes.string.isRequired,
      keepLaunches: PropTypes.string.isRequired,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    updateConfigurationAttributesAction: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    userRoles: userRolesType,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    lang: PropTypes.string,
    retention: PropTypes.number,
    formValues: PropTypes.object,
    isLoading: PropTypes.bool,
  };

  static defaultProps = {
    lang: 'en',
    retention: null,
    isLoading: false,
    userRoles: {},
  };
  state = {
    processingData: false,
  };

  componentDidMount() {
    const { interruptJobTime, keepLogs, keepScreenshots, keepLaunches } = this.props.jobConfig;
    this.props.initialize({
      interruptJobTime: Number(interruptJobTime),
      keepLaunches: Number(this.getMinRetentionValue(keepLaunches)),
      keepLogs: Number(this.getMinRetentionValue(keepLogs)),
      keepScreenshots: Number(this.getMinRetentionValue(keepScreenshots)),
    });
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.jobConfig, this.props.jobConfig)) {
      const { interruptJobTime, keepLogs, keepScreenshots, keepLaunches } = this.props.jobConfig;
      this.props.initialize({
        interruptJobTime: Number(interruptJobTime),
        keepLaunches: Number(this.getMinRetentionValue(keepLaunches)),
        keepLogs: Number(this.getMinRetentionValue(keepLogs)),
        keepScreenshots: Number(this.getMinRetentionValue(keepScreenshots)),
      });
    }
  }

  onFormSubmit = (formData) => {
    this.setState({ processingData: true });

    this.props.tracking.trackEvent(
      PROJECT_SETTINGS_GENERAL_TAB_EVENTS.CLICK_SUBMIT(
        getInactivityTimeoutAnalytics(formData.interruptJobTime),
        getAnalyticsData(formData.keepLaunches, formData.keepLogs, formData.keepScreenshots),
      ),
    );
    const preparedData = normalizeAttributesWithPrefix(formData, JOB_ATTRIBUTE_PREFIX);
    const data = {
      configuration: {
        attributes: {
          ...preparedData,
        },
      },
    };
    fetch(URLS.projectByName(this.props.projectKey), { method: 'put', data })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.updateConfigurationAttributesAction(data);
        this.setState({ processingData: false });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
        this.setState({ processingData: false });
      });
  };

  retentionOptions = [
    { label: this.props.intl.formatMessage(settingsMessages.week1), value: daysToSeconds(7) },
    { label: this.props.intl.formatMessage(settingsMessages.week2), value: daysToSeconds(14) },
    { label: this.props.intl.formatMessage(settingsMessages.week3), value: daysToSeconds(21) },
    { label: this.props.intl.formatMessage(settingsMessages.month1), value: daysToSeconds(30) },
    { label: this.props.intl.formatMessage(settingsMessages.month3), value: daysToSeconds(90) },
    { label: this.props.intl.formatMessage(settingsMessages.month6), value: daysToSeconds(180) },
    { label: this.props.intl.formatMessage(settingsMessages.forever), value: 0 },
  ];

  interruptJobTime = [
    { label: this.props.intl.formatMessage(settingsMessages.hour1), value: hoursToSeconds(1) },
    { label: this.props.intl.formatMessage(settingsMessages.hour3), value: hoursToSeconds(3) },
    { label: this.props.intl.formatMessage(settingsMessages.hour6), value: hoursToSeconds(6) },
    { label: this.props.intl.formatMessage(settingsMessages.hour12), value: hoursToSeconds(12) },
    { label: this.props.intl.formatMessage(settingsMessages.day1), value: daysToSeconds(1) },
    { label: this.props.intl.formatMessage(settingsMessages.week1), value: daysToSeconds(7) },
  ];

  getMinRetentionValue = (value) => {
    const { retention } = this.props;

    return retention === null || retention > value || retention === 0 ? value : retention;
  };

  getRetentionOptions = () => {
    const { retention, lang } = this.props;

    if (!retention || retention === 0) {
      return this.retentionOptions;
    }

    const options = this.retentionOptions.filter(
      (option) => option.value <= retention && option.value !== 0,
    );

    if ((options.length && options[options.length - 1].value !== retention) || !options.length) {
      options.push({ label: secondsToDays(retention, lang), value: retention });
    }

    return options;
  };

  createValueFormatter = (values) => (value) => {
    const selectedOption = values.find((option) => option.value === value);
    if (selectedOption) {
      return selectedOption;
    }
    return { label: secondsToDays(value, this.props.lang), value };
  };

  formatRetention = this.createValueFormatter(this.getRetentionOptions());

  formatInputValues = () => {
    const { formValues } = this.props;
    if (!formValues) {
      return [];
    }
    const arrValues = Object.entries(formValues).map((elem) => {
      const [key, value] = elem;
      return value === 0 ? [key, Infinity] : elem;
    });
    const mapValues = new Map(arrValues);
    const inputValues = Object.fromEntries(mapValues);
    return inputValues;
  };

  getLaunchesOptions = () => {
    const inputValues = this.formatInputValues();
    const options = this.getRetentionOptions();
    const newOptions = options.map((elem) => {
      const disabled =
        elem.value !== 0 &&
        (elem.value < inputValues.keepLogs || elem.value < inputValues.keepScreenshots);
      return {
        ...elem,
        disabled,
        title: this.props.intl.formatMessage(settingsMessages.keepLaunchesTooltip),
      };
    });
    return newOptions;
  };

  getLogOptions = () => {
    const inputValues = this.formatInputValues();
    const options = this.getRetentionOptions();
    const newOptions = options.map((elem) => {
      const disabled =
        elem.value === 0
          ? inputValues.keepLaunches !== Infinity
          : elem.value < inputValues.keepScreenshots;
      const hidden =
        elem.value === 0
          ? inputValues.keepLaunches !== Infinity
          : elem.value > inputValues.keepLaunches;
      return {
        ...elem,
        disabled,
        hidden,
        title: this.props.intl.formatMessage(settingsMessages.keepLogsTooltip),
      };
    });
    if (newOptions.every((v) => v.hidden)) {
      newOptions.push(this.formatRetention(inputValues.keepLogs));
    }
    return newOptions;
  };

  getScreenshotsOptions = () => {
    const inputValues = this.formatInputValues();
    const options = this.getRetentionOptions();
    const newOptions = options.map((elem) => {
      const isHidden =
        elem.value === 0 ? elem.value !== inputValues.keepLogs : elem.value > inputValues.keepLogs;
      const hidden = inputValues.keepLogs === Infinity ? false : isHidden;
      return { ...elem, hidden };
    });
    if (newOptions.every((v) => v.hidden)) {
      newOptions.push(this.formatRetention(inputValues.keepScreenshots));
    }
    return newOptions;
  };

  createTrackingFunction = (createEvent, formatValue = this.formatRetention) => (value) => {
    const label = formatValue(value).label;
    this.props.tracking.trackEvent(createEvent(label));
  };

  formatInterruptJobTimes = this.createValueFormatter(this.interruptJobTime);

  render() {
    const { intl, userRoles, isLoading, projectName } = this.props;
    const { processingData } = this.state;
    const canPerformUpdate = canUpdateSettings(userRoles);
    const isDisabled = !canPerformUpdate || processingData;
    return isLoading ? (
      <SpinningPreloader />
    ) : (
      <div className={cx('general-tab')}>
        <form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
          <div>
            <div className={cx('fake-input-label')}>
              {intl.formatMessage(messages.projectNameLabel)}
            </div>
            <div className={cx('fake-input')} title={projectName}>
              {projectName}
            </div>
          </div>
          <FieldElement
            name="interruptJobTime"
            label={intl.formatMessage(messages.interruptedJob)}
            onChange={this.createTrackingFunction(
              SETTINGS_PAGE_EVENTS.inactivityTimeoutGeneral,
              this.formatInterruptJobTimes,
            )}
            description={intl.formatMessage(messages.interruptedJobDescription)}
            disabled={isDisabled}
          >
            <Dropdown className={cx('dropdown')} options={this.interruptJobTime} mobileDisabled />
          </FieldElement>
          <FieldElement
            name="keepLaunches"
            label={intl.formatMessage(settingsMessages.keepLaunches)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepLaunchesGeneral)}
            description={intl.formatMessage(settingsMessages.keepLaunchesDescription)}
            disabled={isDisabled}
          >
            <Dropdown
              className={cx('dropdown')}
              options={this.getLaunchesOptions()}
              mobileDisabled
            />
          </FieldElement>
          <FieldElement
            name="keepLogs"
            label={intl.formatMessage(settingsMessages.keepLogs)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepLogsGeneral)}
            description={intl.formatMessage(settingsMessages.keepLogsDescription)}
            disabled={isDisabled}
          >
            <Dropdown className={cx('dropdown')} options={this.getLogOptions()} mobileDisabled />
          </FieldElement>
          <FieldElement
            name="keepScreenshots"
            label={intl.formatMessage(settingsMessages.keepScreenshots)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepScreenshotsGeneral)}
            description={intl.formatMessage(settingsMessages.keepScreenshotsDescription)}
            disabled={isDisabled}
          >
            <Dropdown
              className={cx('dropdown')}
              options={this.getScreenshotsOptions()}
              mobileDisabled
            />
          </FieldElement>
          {canPerformUpdate && (
            <div className={cx('submit-block')}>
              <Button type="submit" disabled={isDisabled}>
                {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
              </Button>
              {processingData && (
                <div className={cx('preloader-block')}>
                  <BubblesLoader className={cx('preloader')} />
                  <span className={cx('preloader-text')}>
                    {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.processData)}
                  </span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    );
  }
}
