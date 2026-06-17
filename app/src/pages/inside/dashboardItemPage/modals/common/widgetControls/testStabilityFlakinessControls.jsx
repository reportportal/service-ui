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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import {
  validate,
  commonValidators,
  composeBoundValidators,
  bindMessageToValidator,
} from 'common/utils/validation';
import { URLS } from 'common/urls';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { activeProjectSelector } from 'controllers/user';
import { DEFAULT_LAUNCHES_LIMIT } from 'controllers/testItem';
import { injectIntl, defineMessages } from 'react-intl';
import { FiltersControl, InputControl, CheckboxControl, AttributesFieldArrayControl } from './controls';
import { ITEMS_INPUT_WIDTH } from './constants';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

/** Default executions per logical launch (aligned with classifier default). */
const DEFAULT_ITEMS_COUNT = '10';
const MAX_ATTRIBUTES_AMOUNT = 10;

const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'TestStabilityFlakinessControls.ItemsFieldLabel',
    defaultMessage: 'Last N executions per launch',
  },
  IncludeMethodsControlText: {
    id: 'TestStabilityFlakinessControls.IncludeMethodsControlText',
    defaultMessage: 'Include Before and After methods',
  },
  AggregateByTestNameLabel: {
    id: 'TestStabilityFlakinessControls.AggregateByTestNameLabel',
    defaultMessage:
      'Merge rows with the same test name — unique titles only; totals will be lower than summing launch TOTALs',
  },
  LatestLaunchesOnlyLabel: {
    id: 'TestStabilityFlakinessControls.LatestLaunchesOnlyLabel',
    defaultMessage:
      'Latest launch per pipeline name only (matches Launches page; turn off to include historical reruns)',
  },
  ItemsValidationError: {
    id: 'TestStabilityFlakinessControls.ItemsValidationError',
    defaultMessage: 'Value should be from 2 to 600',
  },
  attributesTitle: {
    id: 'TestStabilityFlakinessControls.attributesTitle',
    defaultMessage: 'Group by attributes',
  },
  calculationHelp: {
    id: 'TestStabilityFlakinessControls.calculationHelp',
    defaultMessage:
      'With “latest launch per name” on (default), the widget uses the same launch set as the Launches page filter. “Last N executions per launch” limits how many runs of each test within a launch are used for transitions. Merge off: one row per launch × test case — group totals align with summing launch TOTAL columns (~1275 for filter 1251). Merge on: collapse same test titles (~765 unique names); summing SUB_MODULE totals can exceed the MODULE row when titles span sub-modules.',
  },
  attributesArrayValidationError: {
    id: 'TestStabilityFlakinessControls.attributesArrayValidationError',
    defaultMessage:
      'Enter an attribute key whose unique value will be used to combine tests into groups',
  },
});

const itemsValidator = (message) =>
  bindMessageToValidator(validate.stabilityWidgetNumberOfLaunches, message);

const attributeKeyValidator = (formatMessage) => (attributes) =>
  composeBoundValidators([
    bindMessageToValidator(
      validate.required,
      formatMessage(messages.attributesArrayValidationError),
    ),
    commonValidators.attributeKey,
    commonValidators.uniqueAttributeKey(attributes),
  ]);

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class TestStabilityFlakinessControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
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
    const cp = widgetSettings.contentParameters || {};
    const wo = cp.widgetOptions || {};
    initializeControlsForm({
      contentParameters: {
        ...cp,
        itemsCount: cp.itemsCount ?? DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          ...wo,
          includeMethods: wo.includeMethods ?? false,
          aggregateByTestName: wo.aggregateByTestName ?? false,
          latestLaunchesOnly: wo.latestLaunchesOnly ?? true,
          attributeKeys: wo.attributeKeys ?? [],
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];

  renderAttributesFieldArray = ({ fields, fieldValidator }) => {
    const {
      activeProject,
      widgetSettings: { contentParameters, filters },
      isMainControlsDisabled,
    } = this.props;
    const filterId = filters?.length && filters[0].value;
    const isLatest = MODES_VALUES[CHART_MODES.ALL_LAUNCHES];

    return (
      <AttributesFieldArrayControl
        fields={fields}
        fieldValidator={fieldValidator}
        maxAttributesAmount={MAX_ATTRIBUTES_AMOUNT}
        showRemainingLevels
        getURI={URLS.itemAttributeKeysAllSearch(
          activeProject,
          filterId,
          isLatest,
          DEFAULT_LAUNCHES_LIMIT,
        )}
        disabled={isMainControlsDisabled}
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
          <ScrollWrapper hideTracksWhenNotNeeded autoHeight autoHeightMax={300}>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={itemsValidator(formatMessage(messages.ItemsValidationError))}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.ItemsFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
                disabled={isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.includeMethods" format={Boolean}>
              <CheckboxControl
                fieldLabel=" "
                text={formatMessage(messages.IncludeMethodsControlText)}
                disabled={isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.aggregateByTestName" format={Boolean}>
              <CheckboxControl
                fieldLabel=" "
                text={formatMessage(messages.AggregateByTestNameLabel)}
                disabled={isMainControlsDisabled}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.latestLaunchesOnly" format={Boolean}>
              <CheckboxControl
                fieldLabel=" "
                text={formatMessage(messages.LatestLaunchesOnlyLabel)}
                disabled={isMainControlsDisabled}
              />
            </FieldProvider>
            <div className={cx('component-header')}>{formatMessage(messages.attributesTitle)}</div>
            <p className={cx('calculation-help')}>{formatMessage(messages.calculationHelp)}</p>
            <FieldArray
              name="contentParameters.widgetOptions.attributeKeys"
              component={this.renderAttributesFieldArray}
              fieldValidator={attributeKeyValidator(formatMessage)}
            />
          </ScrollWrapper>
        )}
      </Fragment>
    );
  }
}
