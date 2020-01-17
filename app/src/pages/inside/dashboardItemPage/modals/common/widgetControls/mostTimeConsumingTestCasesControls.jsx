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
import { connect } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { activeProjectSelector } from 'controllers/user';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { URLS } from 'common/urls';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { PASSED_FAILED_LAUNCHES_OPTIONS } from './constants';
import { DropdownControl, TogglerControl, TagsControl, CheckboxControl } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';

const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'MostTimeConsumingTestCasesControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'MostTimeConsumingTestCasesControls.ItemsFieldLabel',
    defaultMessage: 'Launches count',
  },
  LaunchNameFieldLabel: {
    id: 'MostTimeConsumingTestCasesControls.LaunchNameFieldLabel',
    defaultMessage: 'Launch name',
  },
  LaunchNamePlaceholder: {
    id: 'MostTimeConsumingTestCasesControls.LaunchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  IncludeMethodsControlText: {
    id: 'MostTimeConsumingTestCasesControls.IncludeMethodsControlText',
    defaultMessage: 'Include Before and After methods',
  },
  LaunchNamesValidationError: {
    id: 'MostTimeConsumingTestCasesControls.LaunchNamesValidationError',
    defaultMessage: 'You must select at least one item',
  },
  ContentFieldsValidationError: {
    id: 'MostTimeConsumingTestCasesControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const validators = {
  launchNames: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.LaunchNamesValidationError),
  contentFields: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.ContentFieldsValidationError),
};

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class MostTimeConsumingTestCasesControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeControlsForm } = props;
    this.criteria = getWidgetCriteriaOptions([PASSED_FAILED_LAUNCHES_OPTIONS], intl.formatMessage);
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: this.criteria.map((criteria) => criteria.value),
        itemsCount: 1,
        widgetOptions: {
          viewMode: MODES_VALUES[CHART_MODES.BAR_VIEW],
          includeMethods: false,
          launchNameFilter: false,
        },
      },
      filters: [],
    });
  }

  formatLaunchNameOptions = (values) => values.map((value) => ({ value, label: value }));

  render() {
    const {
      intl: { formatMessage },
      activeProject,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="contentParameters.contentFields"
          validate={validators.contentFields(formatMessage)}
        >
          <DropdownControl
            fieldLabel={formatMessage(messages.CriteriaFieldLabel)}
            multiple
            selectAll
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.launchNameFilter"
          validate={validators.launchNames(formatMessage)}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={formatMessage(messages.LaunchNamePlaceholder)}
            minLength={3}
            getURI={URLS.launchNameSearch(activeProject)}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.viewMode">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.BAR_VIEW, CHART_MODES.TABLE_VIEW],
              formatMessage,
            )}
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
