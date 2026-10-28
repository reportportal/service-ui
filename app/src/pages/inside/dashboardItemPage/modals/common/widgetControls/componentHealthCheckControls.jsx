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
import { FieldArray, change, untouch } from 'redux-form';
import { Checkbox, FieldNumber } from '@reportportal/ui-kit';
import {
  validate,
  commonValidators,
  composeBoundValidators,
  bindMessageToValidator,
} from 'common/utils/validation';
import { URLS } from 'common/urls';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DEFAULT_LAUNCHES_LIMIT } from 'controllers/testItem';
import { projectKeySelector } from 'controllers/project';
import { FieldErrorHint } from 'components/fields';
import { WIDGET_WIZARD_FORM } from '../constants';
import { RadioGroupControl } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { FiltersControlV2, AttributesFieldArrayControl } from './controls';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

const MAX_ATTRIBUTES_AMOUNT = 10;
const DEFAULT_PASSING_RATE = '100';
const DEFAULT_ATTRIBUTE_KEY = '';

const messages = defineMessages({
  passingRateFieldLabel: {
    id: 'ComponentHealthCheckControls.PassingRateFieldLabel',
    defaultMessage: 'The min allowable passing rate for the component',
  },
  componentTitle: {
    id: 'ComponentHealthCheckControls.ComponentTitle',
    defaultMessage: 'Component',
  },
  passingRateValidationError: {
    id: 'ComponentHealthCheckControls.PassingRateValidationError',
    defaultMessage: 'Should have value from 50 to 100',
  },
  attributesArrayValidationError: {
    id: 'ComponentHealthCheckControls.attributesArrayValidationError',
    defaultMessage:
      'Enter an attribute key whose unique value will be used for combine tests into groups',
  },
  excludeSkipped: {
    id: 'ComponentHealthCheckControls.excludeSkipped',
    defaultMessage: 'Exclude Skipped tests from statistics',
  },
  addAttributeKeyButton: {
    id: 'ComponentHealthCheckControls.addAttributeKeyButton',
    defaultMessage: 'New levels cannot be added until filter is selected',
  },
  attributeKeyInput: {
    id: 'ComponentHealthCheckControls.attributeKeyInput',
    defaultMessage: 'Please select a filter first',
  },
});

const passingRateValidator = (formatMessage) =>
  bindMessageToValidator(
    validate.healthCheckWidgetPassingRate,
    formatMessage(messages.passingRateValidationError),
  );
const attributeKeyValidator = (formatMessage) => (attributes) =>
  composeBoundValidators([
    bindMessageToValidator(
      validate.required,
      formatMessage(messages.attributesArrayValidationError),
    ),
    commonValidators.attributeKey,
    commonValidators.uniqueAttributeKey(attributes),
  ]);

@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
  }),
  {
    changeField: (field, value) => change(WIDGET_WIZARD_FORM, field, value, null),
    untouchField: (field) => untouch(WIDGET_WIZARD_FORM, field),
  },
)
@injectIntl
export class ComponentHealthCheckControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
    projectKey: PropTypes.string.isRequired,
    changeField: PropTypes.func.isRequired,
    untouchField: PropTypes.func.isRequired,
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
        itemsCount: DEFAULT_LAUNCHES_LIMIT,
        contentFields: [],
        widgetOptions: {
          minPassingRate: DEFAULT_PASSING_RATE,
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
          attributeKeys: [DEFAULT_ATTRIBUTE_KEY],
          excludeSkipped: false,
        },
      },
    });
  }

  componentDidUpdate = (prevProps) => {
    const prevFilterId = prevProps?.widgetSettings?.filters?.[0]?.value;
    const currentFilterId = this.props.widgetSettings?.filters?.[0]?.value;

    if (prevFilterId && currentFilterId && prevFilterId !== currentFilterId) {
      this.props.changeField('contentParameters.widgetOptions.attributeKeys', [
        DEFAULT_ATTRIBUTE_KEY,
      ]);
      this.props.untouchField('contentParameters.widgetOptions.attributeKeys[0]');
    }
  };

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];

  renderAttributesFieldArray = ({ fields, fieldValidator }) => {
    const {
      projectKey,
      intl: { formatMessage },
      widgetSettings: { contentParameters, filters },
      isMainControlsDisabled,
    } = this.props;
    const filterId = filters?.length && filters[0].value;
    const isLatest =
      contentParameters?.widgetOptions.latest || MODES_VALUES[CHART_MODES.ALL_LAUNCHES];

    return (
      <AttributesFieldArrayControl
        fields={fields}
        fieldValidator={fieldValidator}
        maxAttributesAmount={MAX_ATTRIBUTES_AMOUNT}
        showRemainingLevels
        disabled={!filterId || isMainControlsDisabled}
        inputTooltip={filterId ? null : formatMessage(messages.attributeKeyInput)}
        addButtonTooltip={filterId ? null : formatMessage(messages.addAttributeKeyButton)}
        withOwnerLevel
        getURI={URLS.itemAttributeKeysAllSearch(
          projectKey,
          filterId,
          isLatest,
          DEFAULT_LAUNCHES_LIMIT,
        )}
      />
    );
  };

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
          <>
            <FieldProvider name="contentParameters.widgetOptions.latest">
              <RadioGroupControl
                options={getWidgetModeOptions(
                  [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
                  formatMessage,
                )}
                label={formatMessage(widgetControlsMessages.launchesLabel)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.excludeSkipped" format={Boolean}>
              <Checkbox disabled={disabled || isMainControlsDisabled}>
                {formatMessage(messages.excludeSkipped)}
              </Checkbox>
            </FieldProvider>
            <FieldProvider
              name="contentParameters.widgetOptions.minPassingRate"
              validate={passingRateValidator(formatMessage)}
              format={String}
              normalize={this.normalizeValue}
              className={cx('field-number')}
            >
              <FieldErrorHint provideHint={false}>
                <FieldNumber
                  label={formatMessage(messages.passingRateFieldLabel)}
                  maxLength={3}
                  defaultWidth={false}
                  postfix="%"
                  disabled={disabled || isMainControlsDisabled}
                  max={100}
                />
              </FieldErrorHint>
            </FieldProvider>
            <FieldArray
              name="contentParameters.widgetOptions.attributeKeys"
              component={this.renderAttributesFieldArray}
              fieldValidator={attributeKeyValidator(formatMessage)}
            />
          </>
        )}
      </Fragment>
    );
  }
}
