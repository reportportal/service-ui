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
import { FieldProvider } from 'components/fields/fieldProvider';
import { activeProjectSelector } from 'controllers/user';
import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { validate, bindMessageToValidator, commonValidators } from 'common/utils/validation';
import { ITEMS_INPUT_WIDTH } from './constants';
import { InputControl, TagsControl, CheckboxControl } from './controls';

const DEFAULT_ITEMS_COUNT = '30';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'FlakyTestCasesTableControls.ItemsFieldLabel',
    defaultMessage: 'Launches count',
  },
  LaunchNameFieldLabel: {
    id: 'FlakyTestCasesTableControls.LaunchNameFieldLabel',
    defaultMessage: 'Launch name',
  },
  LaunchNamePlaceholder: {
    id: 'FlakyTestCasesTableControls.LaunchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  IncludeMethodsControlText: {
    id: 'FlakyTestCasesTableControls.IncludeMethodsControlText',
    defaultMessage: 'Include Before and After methods',
  },
  ItemsValidationError: {
    id: 'FlakyTestCasesTableControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 2 to 600',
  },
  LaunchNamesValidationError: {
    id: 'FlakyTestCasesTableControls.LaunchNamesValidationError',
    defaultMessage: 'You must select at least one item',
  },
});

const itemsValidator = (message) =>
  bindMessageToValidator(validate.flakyWidgetNumberOfLaunches, message);

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class FlakyTestCasesTableControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          includeMethods: false,
          launchNameFilter: null,
        },
      },
      filters: [],
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      activeProject,
    } = this.props;

    return (
      <Fragment>
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
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.launchNameFilter"
          validate={commonValidators.createWidgetContentFieldsValidator(
            formatMessage(messages.LaunchNamesValidationError),
          )}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={formatMessage(messages.LaunchNamePlaceholder)}
            minLength={3}
            getURI={URLS.launchNameSearch(activeProject)}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.includeMethods">
          <CheckboxControl
            fieldLabel=" "
            text={formatMessage(messages.IncludeMethodsControlText)}
          />
        </FieldProvider>
      </Fragment>
    );
  }
}
