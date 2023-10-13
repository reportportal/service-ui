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
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { ToggleButton } from 'components/buttons/toggleButton';
import {
  SETTINGS_PAGE_EVENTS,
  getAutoAnalysisMinimumShouldMatchSubmitEvent,
} from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { AccuracyFormBlock } from './accuracyFormBlock';
import {
  NUMBER_OF_LOG_LINES,
  MIN_SHOULD_MATCH,
  ALL_MESSAGES_SHOULD_MATCH,
  SEARCH_LOGS_MIN_SHOULD_MATCH,
} from '../constants';
import styles from './analysisForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  analysisModeTitle: {
    id: 'AnalysisForm.analysisModeTitle',
    defaultMessage: 'Mode of Auto-Analyse Accuracy',
  },
  analysisClassicModeTitle: {
    id: 'AnalysisForm.analysisClassicModeTitle',
    defaultMessage: 'Classic',
  },
  analysisModerateModeTitle: {
    id: 'AnalysisForm.analysisModerateModeTitle',
    defaultMessage: 'Moderate',
  },
  analysisLightModeTitle: {
    id: 'AnalysisForm.analysisLightModeTitle',
    defaultMessage: 'Light',
  },
});

const selector = formValueSelector('analysisForm');

const analysisModeConfig = {
  Classic: {
    [MIN_SHOULD_MATCH]: 95,
    [SEARCH_LOGS_MIN_SHOULD_MATCH]: 95,
    [NUMBER_OF_LOG_LINES]: -1,
  },
  Moderate: {
    [MIN_SHOULD_MATCH]: 80,
    [SEARCH_LOGS_MIN_SHOULD_MATCH]: 95,
    [NUMBER_OF_LOG_LINES]: 5,
  },
  Light: {
    [MIN_SHOULD_MATCH]: 60,
    [SEARCH_LOGS_MIN_SHOULD_MATCH]: 95,
    [NUMBER_OF_LOG_LINES]: 3,
  },
};

const DEFAULT_ANALYSIS_MODE = 'Classic';

@reduxForm({
  form: 'analysisForm',
  validate: ({ minShouldMatch, searchLogsMinShouldMatch }) => ({
    minShouldMatch: bindMessageToValidator(
      validate.analyzerMinShouldMatch,
      'minShouldMatchHint',
    )(minShouldMatch),
    searchLogsMinShouldMatch: bindMessageToValidator(
      validate.searchLogsMinShouldMatch,
      'searchLogsMinShouldMatch',
    )(searchLogsMinShouldMatch),
  }),
})
@connect((state) => ({
  formInputsValues: selector(
    state,
    MIN_SHOULD_MATCH,
    NUMBER_OF_LOG_LINES,
    SEARCH_LOGS_MIN_SHOULD_MATCH,
  ),
}))
@injectIntl
@track()
export class AnalysisForm extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    disabled: PropTypes.bool,
    initialValues: PropTypes.object,
    formInputsValues: PropTypes.object,
    analysisBaseSettings: PropTypes.object,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    onFormSubmit: PropTypes.func,
    isAnalyzerServiceAvailable: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    initialValues: {},
    formInputsValues: {},
    analysisBaseSettings: {},
    change: () => {},
    handleSubmit: () => {},
    onFormSubmit: () => {},
    isAnalyzerServiceAvailable: true,
  };

  state = {
    autoAnalysisMode: DEFAULT_ANALYSIS_MODE,
  };

  componentDidMount() {
    this.setAnalysisMode(this.props.initialValues);
  }

  onInputChange = (event, newValue, previousValue, name) => {
    const formInputsValues = this.props.formInputsValues;
    if (name === ALL_MESSAGES_SHOULD_MATCH) {
      this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.toggleBigMessagesShouldMatch(newValue));
      return;
    }
    formInputsValues[name] = newValue;
    this.setAnalysisMode(formInputsValues);
  };

  setAnalysisMode = (modeConfig) => {
    const analysisModeKeys = Object.keys(analysisModeConfig);
    const existingMode = analysisModeKeys.find(
      (key) =>
        analysisModeConfig[key][MIN_SHOULD_MATCH] === Number(modeConfig[MIN_SHOULD_MATCH]) &&
        analysisModeConfig[key][SEARCH_LOGS_MIN_SHOULD_MATCH] ===
          Number(modeConfig[SEARCH_LOGS_MIN_SHOULD_MATCH]) &&
        analysisModeConfig[key][NUMBER_OF_LOG_LINES] === Number(modeConfig[NUMBER_OF_LOG_LINES]),
    );
    this.setState({
      autoAnalysisMode: existingMode || '',
    });
  };

  tabItems = [
    {
      value: 'Classic',
      label: this.props.intl.formatMessage(messages.analysisClassicModeTitle),
    },
    {
      value: 'Moderate',
      label: this.props.intl.formatMessage(messages.analysisModerateModeTitle),
    },
    {
      value: 'Light',
      label: this.props.intl.formatMessage(messages.analysisLightModeTitle),
    },
  ];

  tabChangeHandle = (newValue) => {
    const { tracking, change } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.toggleAutoAnalysisMode(newValue));
    change(MIN_SHOULD_MATCH, analysisModeConfig[newValue][MIN_SHOULD_MATCH]);
    change(
      SEARCH_LOGS_MIN_SHOULD_MATCH,
      analysisModeConfig[newValue][SEARCH_LOGS_MIN_SHOULD_MATCH],
    );
    change(NUMBER_OF_LOG_LINES, analysisModeConfig[newValue][NUMBER_OF_LOG_LINES]);

    this.setState({
      autoAnalysisMode: newValue,
    });
  };

  submitHandler = (data) => {
    const { tracking, onFormSubmit, analysisBaseSettings } = this.props;
    const {
      minShouldMatch,
      numberOfLogLines,
      allMessagesShouldMatch,
      searchLogsMinShouldMatch,
    } = data;
    const { autoAnalyzerMode: base, isAutoAnalyzerEnabled } = analysisBaseSettings;

    tracking.trackEvent(getAutoAnalysisMinimumShouldMatchSubmitEvent(minShouldMatch));
    tracking.trackEvent(
      SETTINGS_PAGE_EVENTS.submitAutoAnalysisSettings(
        isAutoAnalyzerEnabled,
        base,
        this.state.autoAnalysisMode,
        numberOfLogLines,
        allMessagesShouldMatch,
        minShouldMatch,
        searchLogsMinShouldMatch,
      ),
    );
    onFormSubmit(data);
  };

  render() {
    const { intl, handleSubmit, disabled, isAnalyzerServiceAvailable } = this.props;

    return (
      <form className={cx('analysis-form')} onSubmit={handleSubmit(this.submitHandler)}>
        <div className={cx('accuracy-form-group')}>
          <span className={cx('tabs-container-label')}>
            {intl.formatMessage(messages.analysisModeTitle)}
          </span>
          <div className={cx('toggle-button-wrapper')}>
            <ToggleButton
              disabled={disabled || !isAnalyzerServiceAvailable}
              items={this.tabItems}
              value={this.state.autoAnalysisMode}
              mobileDisabled
              onChange={this.tabChangeHandle}
              title={
                isAnalyzerServiceAvailable
                  ? ''
                  : intl.formatMessage(COMMON_LOCALE_KEYS.ANALYZER_DISABLED)
              }
            />
          </div>
        </div>
        <AccuracyFormBlock
          disabled={disabled}
          onInputChange={this.onInputChange}
          isAnalyzerServiceAvailable={isAnalyzerServiceAvailable}
        />
      </form>
    );
  }
}
