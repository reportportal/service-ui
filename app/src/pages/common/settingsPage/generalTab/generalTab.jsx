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
import { formValueSelector, reduxForm } from 'redux-form';
import moment from 'moment';
import { URLS } from 'common/urls';
import { fetch, secondsToDays } from 'common/utils';
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
const selector = formValueSelector('generalForm');

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
    retention: PropTypes.number,
    formValues: PropTypes.object,
  };

  static defaultProps = {
    projectId: '',
    fetchProjectAction: () => {},
    lang: 'en',
    retention: null,
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
        title: this.props.intl.formatMessage(Messages.keepLaunchesTooltip),
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
        title: this.props.intl.formatMessage(Messages.keepLogsTooltip),
      };
    });
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
    return newOptions;
  };

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
            <InputDropdown options={this.getLaunchesOptions()} mobileDisabled />
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
            <InputDropdown options={this.getLogOptions()} mobileDisabled />
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
            <InputDropdown options={this.getScreenshotsOptions()} mobileDisabled />
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
