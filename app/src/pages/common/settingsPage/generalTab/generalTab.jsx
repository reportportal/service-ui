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
import isEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { formValueSelector, reduxForm } from 'redux-form';
import moment from 'moment';
import { URLS } from 'common/urls';
import { fetch, secondsToDays } from 'common/utils';
import { canUpdateSettings } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  updateConfigurationAttributesAction,
  jobAttributesSelector,
  normalizeAttributesWithPrefix,
  JOB_ATTRIBUTE_PREFIX,
  projectInfoLoadingSelector,
} from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { FormField } from 'components/fields/formField';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { projectIdSelector } from 'controllers/pages';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { langSelector } from 'controllers/lang';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { Button } from 'componentLibrary/button';
import { Dropdown } from 'componentLibrary/dropdown';
import { withTooltip } from 'componentLibrary/tooltip';
import styles from './generalTab.scss';
import { Messages } from './generalTabMessages';

const cx = classNames.bind(styles);

const hoursToSeconds = (hours) => moment.duration(hours, 'hours').asSeconds();
const daysToSeconds = (days) => moment.duration(days, 'days').asSeconds();
const selector = formValueSelector('generalForm');

const NameTooltip = ({ projectId }) => <span>{projectId}</span>;
NameTooltip.propTypes = {
  projectId: PropTypes.string.isRequired,
};

const NameInput = withTooltip({
  ContentComponent: NameTooltip,
  side: 'bottom',
  dynamicWidth: true,
})(({ projectId }) => <div className={cx('fake-input')}>{projectId}</div>);
NameInput.propTypes = {
  projectId: PropTypes.string.isRequired,
};

@reduxForm({
  form: 'generalForm',
})
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    isLoading: projectInfoLoadingSelector(state),
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
    isLoading: PropTypes.bool,
  };

  static defaultProps = {
    projectId: '',
    fetchProjectAction: () => {},
    lang: 'en',
    retention: null,
    isLoading: false,
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
        this.setState({ processingData: false });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(Messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
        this.setState({ processingData: false });
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
    const { intl, accountRole, userRole, isLoading } = this.props;
    const { processingData } = this.state;
    const isDisabled = !canUpdateSettings(accountRole, userRole) || processingData;
    return isLoading ? (
      <SpinningPreloader />
    ) : (
      <div className={cx('general-tab')}>
        <form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
          <div>
            <div className={cx('fake-input-label')}>Name</div>
            <NameInput projectId={this.props.projectId} />
          </div>
          <FormField
            name="interruptJobTime"
            fieldWrapperClassName={cx('field-input')}
            containerClassName={cx('field-container')}
            labelClassName={cx('label')}
            label={intl.formatMessage(Messages.interruptedJob)}
            onChange={this.createTrackingFunction(
              SETTINGS_PAGE_EVENTS.inactivityTimeoutGeneral,
              this.formatInterruptJobTimes,
            )}
            customBlock={{
              wrapperClassName: cx('hint'),
              node: <p>{intl.formatMessage(Messages.interruptedJobDescription)}</p>,
            }}
            disabled={isDisabled}
            format={this.formatInterruptJobTimes}
          >
            <Dropdown
              customClasses={{ dropdown: cx('dropdown') }}
              options={this.interruptJobTime}
              mobileDisabled
            />
          </FormField>
          <FormField
            name="keepLaunches"
            fieldWrapperClassName={cx('field-input')}
            containerClassName={cx('field-container')}
            labelClassName={cx('label')}
            label={intl.formatMessage(Messages.keepLaunches)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepLaunchesGeneral)}
            customBlock={{
              wrapperClassName: cx('hint'),
              node: <p>{intl.formatMessage(Messages.keepLaunchesDescription)}</p>,
            }}
            disabled={isDisabled}
            format={this.formatRetention}
          >
            <Dropdown
              customClasses={{ dropdown: cx('dropdown') }}
              options={this.getLaunchesOptions()}
              mobileDisabled
            />
          </FormField>
          <FormField
            name="keepLogs"
            fieldWrapperClassName={cx('field-input')}
            containerClassName={cx('field-container')}
            labelClassName={cx('label')}
            label={intl.formatMessage(Messages.keepLogs)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepLogsGeneral)}
            customBlock={{
              wrapperClassName: cx('hint'),
              node: <p>{intl.formatMessage(Messages.keepLogsDescription)}</p>,
            }}
            disabled={isDisabled}
            format={this.formatRetention}
          >
            <Dropdown
              customClasses={{ dropdown: cx('dropdown') }}
              options={this.getLogOptions()}
              mobileDisabled
            />
          </FormField>
          <FormField
            name="keepScreenshots"
            fieldWrapperClassName={cx('field-input')}
            containerClassName={cx('field-container')}
            labelClassName={cx('label')}
            label={intl.formatMessage(Messages.keepScreenshots)}
            onChange={this.createTrackingFunction(SETTINGS_PAGE_EVENTS.keepScreenshotsGeneral)}
            customBlock={{
              wrapperClassName: cx('hint'),
              node: <p>{intl.formatMessage(Messages.keepScreenshotsDescription)}</p>,
            }}
            disabled={isDisabled}
            format={this.formatRetention}
          >
            <Dropdown
              customClasses={{ dropdown: cx('dropdown') }}
              options={this.getScreenshotsOptions()}
              mobileDisabled
            />
          </FormField>
          <div className={cx('submit-block')}>
            <Button variant={'topaz'} type="submit" disabled={isDisabled}>
              {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </Button>
            {processingData && (
              <div className={cx('preloader-block')}>
                <BubblesPreloader
                  color={'topaz'}
                  bubblesCount={7}
                  customClassName={cx('preloader')}
                />
                <span className={cx('preloader-text')}>
                  {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.processData)}
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }
}
