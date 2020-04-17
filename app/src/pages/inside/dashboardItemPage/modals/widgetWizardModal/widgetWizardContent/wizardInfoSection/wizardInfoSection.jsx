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
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import WarningIcon from 'common/img/error-inline.svg';
import { WidgetInfoBlock } from '../../../common/widgetInfoBlock';
import { StepLabelItem } from './stepLabelItem';
import styles from './wizardInfoSection.scss';

const cx = classNames.bind(styles);
const STEPS = ['WidgetSelection', 'WidgetConfiguring', 'WidgetSaving'];
const messages = defineMessages({
  WidgetSelectionStepLabel: {
    id: 'WizardInfoSection.WidgetSelectionStepLabel',
    defaultMessage: 'Select widget type',
  },
  WidgetConfiguringStepLabel: {
    id: 'WizardInfoSection.WidgetConfiguringStepLabel',
    defaultMessage: 'Configure widget',
  },
  WidgetSavingStepLabel: {
    id: 'WizardInfoSection.WidgetSavingStepLabel',
    defaultMessage: 'Save',
  },
});

@injectIntl
export class WizardInfoSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    step: PropTypes.number,
    activeWidget: PropTypes.object,
    widgetSettings: PropTypes.object,
    showConfirmation: PropTypes.bool,
  };
  static defaultProps = {
    step: 0,
    activeWidget: {},
    widgetSettings: {},
    showConfirmation: false,
  };

  render() {
    const {
      intl: { formatMessage },
      step,
      activeWidget,
      widgetSettings,
      projectId,
      showConfirmation,
    } = this.props;

    return (
      <div className={cx('wizard-info-section')}>
        <div className={cx('steps-block')}>
          {STEPS.map((value, index) => (
            <StepLabelItem
              key={value}
              step={index}
              label={formatMessage(messages[`${value}StepLabel`])}
              active={step === index}
              completed={step > index}
            />
          ))}
        </div>
        <WidgetInfoBlock
          projectId={projectId}
          widgetSettings={widgetSettings}
          activeWidget={activeWidget}
          customCondition={step === 1}
        />
        {showConfirmation && (
          <div className={cx('confirmation-warning-block')}>
            <i className={cx('warning-icon')}>{Parser(WarningIcon)}</i>
            <span className={cx('warning-message')}>
              {formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING)}
            </span>
          </div>
        )}
      </div>
    );
  }
}
