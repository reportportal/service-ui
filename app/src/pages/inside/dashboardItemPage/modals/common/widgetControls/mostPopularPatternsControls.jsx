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
import { FieldNumber, FieldText } from '@reportportal/ui-kit';
import { messages as widgetControlsMessages } from './messages';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { URLS } from 'common/urls';
import { createClassnames } from 'common/utils';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { ModalField } from 'components/main/modal';
import { projectKeySelector } from 'controllers/project';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { bindMessageToValidator, commonValidators, validate } from 'common/utils/validation';
import { FIELD_LABEL_WIDTH } from 'pages/inside/dashboardItemPage/modals/common/widgetControls/controls/constants';
import { RadioGroupControl } from './controls';
import { FiltersControlV2 } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import styles from './widgetControls.scss';

const cx = createClassnames(styles);

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
    defaultMessage: 'Value should have size from 1 to 512',
  },
});
const attributeKeyValidator = (message) => bindMessageToValidator(validate.attributeValue, message);

@injectIntl
@connect((state) => ({
  projectKey: projectKeySelector(state),
}))
export class MostPopularPatternsControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    projectKey: PropTypes.string.isRequired,
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

  formatFilterValue = (value) => value?.[0];
  parseFilterValue = (value) => value && [value];
  render() {
    const {
      intl,
      formAppearance,
      onFormAppearanceChange,
      projectKey,
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
        <FieldProvider name="contentParameters.widgetOptions.latest">
          <RadioGroupControl
            options={getWidgetModeOptions(
              [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
              intl.formatMessage,
            )}
            label={intl.formatMessage(widgetControlsMessages.ModeLabel)}
            disabled={disabled || isMainControlsDisabled}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={commonValidators.createNumberOfLaunchesValidator(
            intl.formatMessage(messages.numberOfLaunchesValidationError),
          )}
          format={String}
          normalize={this.normalizeValue}
          className={cx('field-number')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldNumber
              label={intl.formatMessage(messages.numberOfLaunchesLabel)}
              maxLength={3}
              defaultWidth={false}
              disabled={disabled || isMainControlsDisabled}
            />
          </FieldErrorHint>
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
            <FieldErrorHint>
              <AsyncAutocomplete
                getURI={URLS.launchAttributeKeysSearch(projectKey)}
                minLength={1}
                creatable
                placeholder={intl.formatMessage(messages.attributeKeyFieldPlaceholder)}
                disabled={disabled || isMainControlsDisabled}
              />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
      </Fragment>
    );
  }
}
