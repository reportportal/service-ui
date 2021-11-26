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
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
import { FormField } from 'components/fields/formField';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { messages as importMessages } from 'pages/inside/uniqueErrorsPage';
import {
  ANALYZER_ENABLED,
  ANALYZER_MODE,
  UNIQUE_ERROR_ENABLED,
  UNIQUE_ERROR_REMOVE_NUMBERS,
} from '../../constants';
import styles from './strategyBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  autoAnalysisSwitcherTitle: {
    id: 'StrategyBlock.autoAnalysisSwitcherTitle',
    defaultMessage: 'Auto analysis',
  },
  strategySelectorTitle: {
    id: 'StrategyBlock.strategySelectorTitle',
    defaultMessage: 'Base for Auto Analysis',
  },
  analysisStatusInfo: {
    id: 'StrategyBlock.analysisStatusInfo',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
  },
  sameNameLaunchesCaption: {
    id: 'StrategyBlock.sameNameLaunchesCaption',
    defaultMessage: 'Launches with the same name',
  },
  sameNameLaunchesInfo: {
    id: 'StrategyBlock.sameNameLaunchesInfo',
    defaultMessage:
      'The test items are analyzed on base of previously investigated data in launches with the same name',
  },
  allLaunchesCaption: {
    id: 'StrategyBlock.allLaunchesCaption',
    defaultMessage: 'All launches',
  },
  allLaunchesInfo: {
    id: 'StrategyBlock.allLaunchesInfo',
    defaultMessage:
      'The test items are analyzed on base of previously investigated data in all launches',
  },
  uniqueErrorAutoAnalysisSwitcherTitle: {
    id: 'StrategyBlock.uniqueErrorAutoAnalysisSwitcherTitle',
    defaultMessage: 'Unique error auto-analysis',
  },
  uniqueErrorAutoAnalysisStatusInfo: {
    id: 'StrategyBlock.uniqueErrorAutoAnalysisStatusInfo',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
  },
  serviceAnalyzerDisabledTooltip: {
    id: 'StrategyBlock.serviceAnalyzerDisabledTooltip',
    defaultMessage: 'Service analyzer is not running',
  },
  unAssignTitleNoPermission: {
    id: 'UnassignButton.unAssignTitleNoPermission',
    defaultMessage: 'You have no enough permission',
  },
});

@injectIntl
@track()
export class StrategyBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    data: PropTypes.object,
    onFormSubmit: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isAnalyzerServiceAvailable: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    data: {},
    onFormSubmit: () => {},
    isAnalyzerServiceAvailable: true,
  };

  changeAnalyzerEnabled = (value) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [ANALYZER_ENABLED]: value,
    });
    tracking.trackEvent(
      value
        ? SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_SWITCHER_ON
        : SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_SWITCHER_OFF,
    );
  };

  changeAnalyzerMode = (event) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [ANALYZER_MODE]: event.target.value,
    });
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.autoAnalysisBase(event.target.value));
  };

  changeUniqueErrorAutoAnalysisEnabled = (value) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [UNIQUE_ERROR_ENABLED]: value,
    });
    tracking.trackEvent(
      value
        ? SETTINGS_PAGE_EVENTS.UNIQUE_ERROR_SWITCHER_ON
        : SETTINGS_PAGE_EVENTS.UNIQUE_ERROR_SWITCHER_OFF,
    );
  };

  changeUniqueErrorsRemoveNumbersEnabled = (value) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [UNIQUE_ERROR_REMOVE_NUMBERS]: value,
    });
    tracking.trackEvent(
      value
        ? SETTINGS_PAGE_EVENTS.UNIQUE_ERRORS_REMOVE_NUMBERS_EXCLUDE
        : SETTINGS_PAGE_EVENTS.UNIQUE_ERRORS_REMOVE_NUMBERS_INCLUDE,
    );
  };

  getUniqueErrorAutoAnalysisTooltip = () => {
    const {
      intl: { formatMessage },
      disabled,
      isAnalyzerServiceAvailable,
    } = this.props;

    if (!isAnalyzerServiceAvailable) {
      return formatMessage(messages.serviceAnalyzerDisabledTooltip);
    } else if (disabled) {
      return formatMessage(messages.unAssignTitleNoPermission);
    } else {
      return '';
    }
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
      data,
      isAnalyzerServiceAvailable,
    } = this.props;

    const isUniqueErrorAutoAnalysisDisabled = disabled || !isAnalyzerServiceAvailable;
    const uniqueErrorAutoAnalysisTooltip = this.getUniqueErrorAutoAnalysisTooltip();
    const options = [
      { label: formatMessage(importMessages.uniqueErrAnalyzeModalIncludeNumbers), value: false },
      { label: formatMessage(importMessages.uniqueErrAnalyzeModalExcludeNumbers), value: true },
    ];

    return (
      <div className={cx('strategy-block')}>
        <FormField
          fieldWrapperClassName={cx('switcher-wrapper')}
          label={formatMessage(messages.autoAnalysisSwitcherTitle)}
          customBlock={{
            node: <p>{Parser(formatMessage(messages.analysisStatusInfo))}</p>,
          }}
          withoutProvider
        >
          <InputBigSwitcher
            value={data[ANALYZER_ENABLED]}
            onChange={this.changeAnalyzerEnabled}
            disabled={disabled}
            mobileDisabled
          />
        </FormField>

        <FormField
          containerClassName={cx('radio-container')}
          fieldWrapperClassName={cx('aa-strategy-option-selector')}
          customBlock={{
            node: <p>{formatMessage(messages.sameNameLaunchesInfo)}</p>,
            wrapperClassName: cx('radio-description'),
          }}
          label={formatMessage(messages.strategySelectorTitle)}
          withoutProvider
        >
          <InputRadio
            ownValue="LAUNCH_NAME"
            value={data[ANALYZER_MODE]}
            onChange={this.changeAnalyzerMode}
            name="aa-strategy"
            disabled={disabled}
            mobileDisabled
          >
            <span className={cx('radio-children')}>
              {formatMessage(messages.sameNameLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>

        <FormField
          containerClassName={cx('radio-container')}
          fieldWrapperClassName={cx('aa-strategy-option-selector')}
          labelClassName={cx('no-label')}
          customBlock={{
            node: <p>{formatMessage(messages.allLaunchesInfo)}</p>,
            wrapperClassName: cx('radio-description'),
          }}
          withoutProvider
        >
          <InputRadio
            ownValue="ALL"
            value={data[ANALYZER_MODE]}
            onChange={this.changeAnalyzerMode}
            name="aa-strategy"
            disabled={disabled}
            mobileDisabled
          >
            <span className={cx('radio-children')}>
              {formatMessage(messages.allLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>

        <FormField
          fieldWrapperClassName={cx('switcher-wrapper')}
          label={formatMessage(messages.uniqueErrorAutoAnalysisSwitcherTitle)}
          customBlock={{
            node: <p>{Parser(formatMessage(messages.uniqueErrorAutoAnalysisStatusInfo))}</p>,
          }}
          withoutProvider
        >
          <InputBigSwitcher
            value={data[UNIQUE_ERROR_ENABLED]}
            onChange={this.changeUniqueErrorAutoAnalysisEnabled}
            disabled={isUniqueErrorAutoAnalysisDisabled}
            mobileDisabled
            title={uniqueErrorAutoAnalysisTooltip}
          />
        </FormField>

        <FormField
          fieldWrapperClassName={cx('unique-errors-remove-numbers')}
          label={formatMessage(importMessages.uniqueErrAnalyzeModalFieldName)}
          withoutProvider
        >
          <InputDropdown
            value={data[UNIQUE_ERROR_REMOVE_NUMBERS]}
            options={options}
            disabled={disabled}
            onChange={this.changeUniqueErrorsRemoveNumbersEnabled}
          />
        </FormField>
      </div>
    );
  }
}
