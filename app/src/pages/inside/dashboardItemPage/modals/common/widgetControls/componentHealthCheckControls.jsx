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
import { injectIntl, defineMessages } from 'react-intl';
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
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import {
  FiltersControl,
  InputControl,
  AttributesFieldArrayControl,
  TogglerControl,
} from './controls';
import { ITEMS_INPUT_WIDTH } from './constants';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

const MAX_ATTRIBUTES_AMOUNT = 10;
const DEFAULT_PASSING_RATE = '100';

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

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@injectIntl
export class ComponentHealthCheckControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    eventsInfo: {},
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
          attributeKeys: [],
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  renderAttributesFieldArray = ({ fields, fieldValidator }) => {
    const {
      activeProject,
      widgetSettings: { contentParameters, filters },
    } = this.props;
    const filterId = filters && filters.length && filters[0].value;
    const isLatest =
      (contentParameters && contentParameters.widgetOptions.latest) ||
      MODES_VALUES[CHART_MODES.ALL_LAUNCHES];

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
      />
    );
  };

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
      eventsInfo,
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
            <div className={cx('component-header')}>{formatMessage(messages.componentTitle)}</div>
            <FieldProvider name="contentParameters.widgetOptions.latest">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
                  formatMessage,
                )}
              />
            </FieldProvider>
            <FieldProvider
              name="contentParameters.widgetOptions.minPassingRate"
              validate={passingRateValidator(formatMessage)}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.passingRateFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
                hintType={'top-right'}
                inputBadge={'%'}
              />
            </FieldProvider>
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
