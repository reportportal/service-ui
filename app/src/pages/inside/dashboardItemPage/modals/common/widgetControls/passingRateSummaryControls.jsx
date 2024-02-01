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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { injectIntl, defineMessages } from 'react-intl';
import { STATS_TOTAL, STATS_PASSED } from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { commonValidators } from 'common/utils/validation';
import {
  EXCLUDING_SKIPPED,
  TOTAL_TEST_CASES,
  FORM_GROUP_CONTROL,
  passingRateOptionMessages,
} from 'components/widgets/singleLevelWidgets/charts/common/passingRateChart/messages';
import track from 'react-tracking';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { ITEMS_INPUT_WIDTH } from './constants';
import { TogglerControl, FiltersControl, InputControl, RadioGroupControl } from './controls';
import { widgetTypesMessages } from '../messages';

const DEFAULT_ITEMS_COUNT = '50';

const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'PassingRateSummaryControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'PassingRateSummaryControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
});

@track()
@injectIntl
export class PassingRateSummaryControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    widgetType: PropTypes.string.isRequired,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    eventsInfo: {},
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [STATS_TOTAL, STATS_PASSED],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          viewMode: MODES_VALUES[CHART_MODES.BAR_VIEW],
          includeSkipped: true,
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];

  handleIncludeSkippedChange = (includeSkipped) => {
    const {
      eventsInfo: { ratioBasedOnChange },
      tracking: { trackEvent },
      widgetType,
    } = this.props;

    const eventType = includeSkipped
      ? 'total_test_cases'
      : passingRateOptionMessages[EXCLUDING_SKIPPED].defaultMessage;

    trackEvent(ratioBasedOnChange(widgetTypesMessages[widgetType].defaultMessage, eventType));
  };

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
      eventsInfo,
    } = this.props;

    const options = [TOTAL_TEST_CASES, EXCLUDING_SKIPPED].map((option) => ({
      label: formatMessage(passingRateOptionMessages[option]),
      value: `${option === TOTAL_TEST_CASES}`,
    }));

    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
            eventsInfo={eventsInfo}
          />
        </FieldProvider>
        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={commonValidators.createNumberOfLaunchesValidator(
                formatMessage(messages.ItemsValidationError),
              )}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.ItemsFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
                hintType={'top-right'}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.viewMode">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.BAR_VIEW, CHART_MODES.PIE_VIEW],
                  formatMessage,
                )}
              />
            </FieldProvider>
            <FieldProvider
              onChange={this.handleIncludeSkippedChange}
              name="contentParameters.widgetOptions.includeSkipped"
            >
              <RadioGroupControl
                options={options}
                fieldLabel={formatMessage(passingRateOptionMessages[FORM_GROUP_CONTROL])}
              />
            </FieldProvider>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
