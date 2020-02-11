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
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { URLS } from 'common/urls';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { ModalField } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { bindMessageToValidator, commonValidators, validate } from 'common/utils/validation';
import { FIELD_LABEL_WIDTH } from 'pages/inside/dashboardItemPage/modals/common/widgetControls/controls/constants';
import { FiltersControl, InputControl, TogglerControl } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { ITEMS_INPUT_WIDTH } from './constants';

const DEFAULT_LAUNCHES_COUNT = '600';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'MostPopularPatternsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  numberOfLaunchesLabel: {
    id: 'MostPopularPatternsControls.numberOfLaunchesLabel',
    defaultMessage: 'Number of launches',
  },
  attributeKeyFieldLabel: {
    id: 'MostPopularPatternsControls.attributeKeyFieldLabel',
    defaultMessage: 'Attribute key',
  },
  attributeKeyFieldPlaceholder: {
    id: 'MostPopularPatternsControls.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  numberOfLaunchesValidationError: {
    id: 'MostPopularPatternsControls.numberOfLaunchesValidationError',
    defaultMessage: 'Number of launches should have value from 1 to 600',
  },
  attributeKeyValidationError: {
    id: 'MostPopularPatternsControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
});
const attributeKeyValidator = (message) => bindMessageToValidator(validate.attributeValue, message);

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class MostPopularPatternsControls extends Component {
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
        itemsCount: DEFAULT_LAUNCHES_COUNT,
        contentFields: [],
        widgetOptions: {
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
          attributeKey: '',
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const { intl, formAppearance, onFormAppearanceChange, activeProject, eventsInfo } = this.props;
    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
            eventsInfo={eventsInfo}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.latest">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
              intl.formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={commonValidators.createNumberOfLaunchesValidator(
            intl.formatMessage(messages.numberOfLaunchesValidationError),
          )}
          format={String}
          normalize={this.normalizeValue}
        >
          <InputControl
            fieldLabel={intl.formatMessage(messages.numberOfLaunchesLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            maxLength="3"
            hintType={'top-right'}
          />
        </FieldProvider>
        <ModalField
          label={intl.formatMessage(messages.attributeKeyFieldLabel)}
          labelWidth={FIELD_LABEL_WIDTH}
        >
          <FieldProvider
            name="contentParameters.widgetOptions.attributeKey"
            validate={attributeKeyValidator(
              intl.formatMessage(messages.attributeKeyValidationError),
            )}
          >
            <AsyncAutocomplete
              getURI={URLS.launchAttributeKeysSearch(activeProject)}
              minLength={1}
              creatable
              placeholder={intl.formatMessage(messages.attributeKeyFieldPlaceholder)}
            />
          </FieldProvider>
        </ModalField>
      </Fragment>
    );
  }
}
