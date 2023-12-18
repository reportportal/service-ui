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
import { URLS } from 'common/urls';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import {
  EXCLUDING_SKIPPED,
  TOTAL_TEST_CASES,
  FORM_GROUP_CONTROL,
  passingRateOptionMessages,
} from 'components/widgets/singleLevelWidgets/charts/common/passingRateChart/messages';
import track from 'react-tracking';
import { activeProjectKeySelector } from 'controllers/user';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { TogglerControl, TagsControl, RadioGroupControl } from './controls';
import { widgetTypesMessages } from '../messages';

const DEFAULT_ITEMS_COUNT = '30';

const messages = defineMessages({
  LaunchNameFieldLabel: {
    id: 'PassingRatePerLaunchControls.LaunchNameFieldLabel',
    defaultMessage: 'Launch name',
  },
  LaunchNamePlaceholder: {
    id: 'PassingRatePerLaunchControls.LaunchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  LaunchNamesValidationError: {
    id: 'PassingRatePerLaunchControls.LaunchNamesValidationError',
    defaultMessage: 'You must select at least one item',
  },
});

const validators = {
  launchNames: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.LaunchNamesValidationError),
};

@track()
@injectIntl
@connect((state) => ({
  projectKey: activeProjectKeySelector(state),
}))
export class PassingRatePerLaunchControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    projectKey: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    widgetType: PropTypes.string.isRequired,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    eventsInfo: {},
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          viewMode: MODES_VALUES[CHART_MODES.BAR_VIEW],
          launchNameFilter: false,
          includeSkipped: true,
        },
      },
      filters: [],
    });
  }

  handleIncludeSkippedChange = (includeSkipped) => {
    const {
      eventsInfo: { ratioBasedOnChange },
      tracking: { trackEvent },
      widgetType,
    } = this.props;

    const eventType = includeSkipped
      ? 'total_test_cases'
      : passingRateOptionMessages[EXCLUDING_SKIPPED].defaultMessage;

    trackEvent(ratioBasedOnChange(widgetTypesMessages[widgetType].defaultMessage, eventType));
  };

  render() {
    const {
      intl: { formatMessage },
      projectKey,
    } = this.props;

    const options = [TOTAL_TEST_CASES, EXCLUDING_SKIPPED].map((option) => ({
      label: formatMessage(passingRateOptionMessages[option]),
      value: `${option === TOTAL_TEST_CASES}`,
    }));

    return (
      <Fragment>
        <FieldProvider
          name="contentParameters.widgetOptions.launchNameFilter"
          validate={validators.launchNames(formatMessage)}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={formatMessage(messages.LaunchNamePlaceholder)}
            minLength={3}
            maxLength={256}
            getURI={URLS.launchNameSearch(projectKey)}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.viewMode">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.BAR_VIEW, CHART_MODES.PIE_VIEW],
              formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider
          onChange={this.handleIncludeSkippedChange}
          name="contentParameters.widgetOptions.includeSkipped"
        >
          <RadioGroupControl
            options={options}
            fieldLabel={formatMessage(passingRateOptionMessages[FORM_GROUP_CONTROL])}
          />
        </FieldProvider>
      </Fragment>
    );
  }
}
