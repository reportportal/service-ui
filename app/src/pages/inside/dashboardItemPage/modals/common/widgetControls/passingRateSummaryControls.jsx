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
import { FieldNumber, Checkbox } from '@reportportal/ui-kit';
import { RadioGroupControl } from './controls';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { injectIntl, defineMessages } from 'react-intl';
import { messages as widgetControlsMessages } from './messages';
import { STATS_TOTAL, STATS_PASSED } from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { commonValidators } from 'common/utils/validation';
import track from 'react-tracking';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { FiltersControlV2 } from './controls';
import { createClassnames } from 'common/utils';
import styles from './widgetControls.scss';

const cx = createClassnames(styles);

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
  excludeSkipped: {
    id: 'PassingRateSummaryControls.excludeSkipped',
    defaultMessage: 'Exclude Skipped tests from statistics',
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
    // eslint-disable-next-line react/no-unused-prop-types
    widgetType: PropTypes.string.isRequired,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isMainControlsDisabled: PropTypes.bool,
  };

  static defaultProps = {
    eventsInfo: {},
    isMainControlsDisabled: false,
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
          excludeSkipped: false,
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
      eventsInfo,
      isMainControlsDisabled,
    } = this.props;
    const filterId = this.props.widgetSettings?.filters?.length && this.props.widgetSettings.filters[0].value;
    const disabled = !filterId;

    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControlV2
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
            eventsInfo={eventsInfo}
            required
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
              className={cx('field-number')}
            >
              <FieldErrorHint provideHint={false}>
                <FieldNumber
                  label={formatMessage(messages.ItemsFieldLabel)}
                  maxLength={3}
                  defaultWidth={false}
                  disabled={disabled || isMainControlsDisabled}
                />
              </FieldErrorHint>
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.viewMode">
            <RadioGroupControl
                options={getWidgetModeOptions(
                  [CHART_MODES.BAR_VIEW, CHART_MODES.PIE_VIEW],
                  formatMessage,
                )}
                label={formatMessage(widgetControlsMessages.ViewLabel)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.excludeSkipped" format={Boolean}>
              <Checkbox disabled={disabled || isMainControlsDisabled}>
                {formatMessage(messages.excludeSkipped)}
              </Checkbox>
            </FieldProvider>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
