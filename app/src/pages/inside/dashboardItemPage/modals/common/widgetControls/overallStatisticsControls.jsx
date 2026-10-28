/*
 * Copyright 2026 EPAM Systems
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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { messages as widgetControlsMessages } from './messages';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { FieldNumber, Dropdown, Checkbox } from '@reportportal/ui-kit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { commonValidators } from 'common/utils/validation';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { LAUNCH_STATUSES_OPTIONS, DEFECT_TYPES_OPTIONS } from './constants';
import { FiltersControlV2, RadioGroupControl } from './controls';
import styles from './overallStatisticsControls.scss';

const cx = classNames.bind(styles);

const DEFAULT_ITEMS_COUNT = '50';

const DEFAULT_WIDGET_OPTIONS = {
  viewMode: MODES_VALUES[CHART_MODES.PANEL_VIEW],
  latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
  separateInterrupted: false,
};

const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'OverallStatisticsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'OverallStatisticsControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'OverallStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
  ContentFieldsValidationError: {
    id: 'OverallStatisticsControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
  SeparateInterruptedLabel: {
    id: 'OverallStatisticsControls.SeparateInterruptedLabel',
    defaultMessage: 'Show the "Interrupted" status independently from "Failed" items',
  },
});

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
export class OverallStatisticsControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
    isMainControlsDisabled: PropTypes.bool,
  };

  static defaultProps = {
    formAppearance: {},
    onFormAppearanceChange: () => {},
    eventsInfo: {},
    isMainControlsDisabled: false,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, defectTypes, initializeControlsForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, DEFECT_TYPES_OPTIONS],
      intl.formatMessage,
      { defectTypes },
    );
    const contentParameters = widgetSettings.contentParameters || {
      contentFields: this.criteria.map((criteria) => criteria.value),
      itemsCount: DEFAULT_ITEMS_COUNT,
      widgetOptions: { ...DEFAULT_WIDGET_OPTIONS },
    };
    initializeControlsForm({
      contentParameters: {
        ...contentParameters,
        widgetOptions: {
          ...DEFAULT_WIDGET_OPTIONS,
          ...contentParameters.widgetOptions,
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];

  formatSeparateInterrupted = (value) => value === true || value === 'true';

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
      eventsInfo,
      isMainControlsDisabled,
    } = this.props;
    const filterId =
      this.props.widgetSettings?.filters?.length && this.props.widgetSettings.filters[0].value;
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
              name="contentParameters.contentFields"
              validate={commonValidators.createWidgetContentFieldsValidator(
                formatMessage(messages.ContentFieldsValidationError),
              )}
            >
              <Dropdown
                label={formatMessage(messages.CriteriaFieldLabel)}
                multiSelect
                isOptionAllVisible
                options={this.criteria}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
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
                  [CHART_MODES.PANEL_VIEW, CHART_MODES.DONUT_VIEW],
                  formatMessage,
                )}
                label={formatMessage(widgetControlsMessages.ViewLabel)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.latest">
              <RadioGroupControl
                options={getWidgetModeOptions(
                  [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
                  formatMessage,
                )}
                label={formatMessage(widgetControlsMessages.ModeLabel)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider
              name="contentParameters.widgetOptions.separateInterrupted"
              format={this.formatSeparateInterrupted}
              className={cx('separate-interrupted-checkbox')}
            >
              <Checkbox disabled={disabled || isMainControlsDisabled}>
                {formatMessage(messages.SeparateInterruptedLabel)}
              </Checkbox>
            </FieldProvider>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
