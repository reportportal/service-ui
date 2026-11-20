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
import { injectIntl, defineMessages } from 'react-intl';
import { messages as widgetControlsMessages } from './messages';
import { FieldNumber } from '@reportportal/ui-kit';
import { RadioGroupControl } from './controls';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import {
  STATS_AB_TOTAL,
  STATS_ND_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
} from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { commonValidators } from 'common/utils/validation';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { FiltersControlV2 } from './controls';
import { createClassnames } from 'common/utils';
import styles from './widgetControls.scss';

const cx = createClassnames(styles);

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'InvestigatedPercentageOfLaunchesControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'InvestigatedPercentageOfLaunchesControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
});

@injectIntl
export class InvestigatedPercentageOfLaunchesControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
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
        contentFields: [
          STATS_PB_TOTAL,
          STATS_AB_TOTAL,
          STATS_SI_TOTAL,
          STATS_ND_TOTAL,
          STATS_TI_TOTAL,
        ],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          timeline: MODES_VALUES[CHART_MODES.LAUNCH_MODE],
          viewMode: getWidgetModeOptions([CHART_MODES.TIMELINE_MODE], props.intl.formatMessage)[0]
            .label,
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
            <FieldProvider name="contentParameters.widgetOptions.timeline">
              <RadioGroupControl
                options={getWidgetModeOptions(
                  [CHART_MODES.LAUNCH_MODE, CHART_MODES.TIMELINE_MODE],
                  formatMessage,
                )}
                label={formatMessage(widgetControlsMessages.ModeLabel)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
