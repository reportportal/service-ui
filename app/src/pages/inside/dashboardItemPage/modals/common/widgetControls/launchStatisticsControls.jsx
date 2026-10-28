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
import { injectIntl, defineMessages } from 'react-intl';
import { messages as widgetControlsMessages } from './messages';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { FieldText, FieldNumber, Dropdown, Checkbox } from '@reportportal/ui-kit';
import { RadioGroupControl } from './controls';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { commonValidators } from 'common/utils/validation';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import classNames from 'classnames/bind';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { LAUNCH_STATUSES_OPTIONS, GROUPED_DEFECT_TYPES_OPTIONS } from './constants';
import { FiltersControlV2 } from './controls';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'LaunchStatisticsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'LaunchStatisticsControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ZoomControlText: {
    id: 'LaunchStatisticsControls.ZoomControlText',
    defaultMessage: 'Zoom widget area',
  },
  ItemsValidationError: {
    id: 'LaunchStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
  ContentFieldsValidationError: {
    id: 'LaunchStatisticsControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
});

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
export class LaunchStatisticsControls extends Component {
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
    eventsInfo: {},
    isMainControlsDisabled: false,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, defectTypes, initializeControlsForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, GROUPED_DEFECT_TYPES_OPTIONS],
      intl.formatMessage,
      { defectTypes },
    );
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: this.criteria.map((criteria) => criteria.value),
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          zoom: false,
          timeline: MODES_VALUES[CHART_MODES.LAUNCH_MODE],
          viewMode: MODES_VALUES[CHART_MODES.AREA_VIEW],
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
              <FieldProvider name="contentParameters.widgetOptions.viewMode">
                <RadioGroupControl
                  options={getWidgetModeOptions(
                    [CHART_MODES.AREA_VIEW, CHART_MODES.BAR_VIEW],
                    formatMessage,
                  )}
                  label={formatMessage(widgetControlsMessages.ViewLabel)}
                  disabled={disabled || isMainControlsDisabled}
                />
              </FieldProvider>
            <div className={cx('zoom-container')}>
              <FieldProvider name="contentParameters.widgetOptions.zoom">
                <Checkbox disabled={disabled || isMainControlsDisabled}>
                  {formatMessage(messages.ZoomControlText)}
                </Checkbox>
              </FieldProvider>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
