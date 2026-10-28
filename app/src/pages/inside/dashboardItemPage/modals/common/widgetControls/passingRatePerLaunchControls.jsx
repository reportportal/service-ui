/* eslint-disable react/no-unused-prop-types */
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
import { messages as widgetControlsMessages } from './messages';
import { connect } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { projectKeySelector } from 'controllers/project';
import { URLS } from 'common/urls';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import track from 'react-tracking';
import { Checkbox } from '@reportportal/ui-kit';
import { RadioGroupControl } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { TagsControl } from './controls';

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
  excludeSkipped: {
    id: 'PassingRatePerLaunchControls.excludeSkipped',
    defaultMessage: 'Exclude Skipped tests from statistics',
  },
});

const validators = {
  launchNames: (formatMessage) => (value) =>
    !value?.length && formatMessage(messages.LaunchNamesValidationError),
};

@track()
@injectIntl
@connect((state) => ({
  projectKey: projectKeySelector(state),
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
        contentFields: [],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          viewMode: MODES_VALUES[CHART_MODES.BAR_VIEW],
          launchNameFilter: false,
          excludeSkipped: false,
        },
      },
      filters: [],
    });
  }

  render() {
    const {
      intl: { formatMessage },
      projectKey,
      isMainControlsDisabled,
    } = this.props;

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
            disabled={isMainControlsDisabled}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.viewMode">
          <RadioGroupControl
            options={getWidgetModeOptions(
              [CHART_MODES.BAR_VIEW, CHART_MODES.PIE_VIEW],
              formatMessage,
            )}
            label={formatMessage(widgetControlsMessages.ViewLabel)}
            disabled={isMainControlsDisabled}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.excludeSkipped" format={Boolean}>
          <Checkbox disabled={isMainControlsDisabled}>
            {formatMessage(messages.excludeSkipped)}
          </Checkbox>
        </FieldProvider>
      </Fragment>
    );
  }
}
