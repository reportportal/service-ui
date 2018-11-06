import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { activeProjectSelector } from 'controllers/user';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { URLS } from 'common/urls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { METADATA_FIELDS, CHART_MODES } from './constants';
import { TogglerControl, TagsControl } from './controls';

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
  LaunchNameFocusPlaceholder: {
    id: 'PassingRatePerLaunchControls.LaunchNameFocusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
  LaunchNameNoMatches: {
    id: 'PassingRatePerLaunchControls.LaunchNameNoMatches',
    defaultMessage: 'No matches found.',
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

@injectIntl
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    launchNamesSearchUrl: URLS.launchNameSearch(activeProjectSelector(state)),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class PassingRatePerLaunchControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    launchNamesSearchUrl: PropTypes.string.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeWizardSecondStepForm } = props;
    initializeWizardSecondStepForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [],
        itemsCount: DEFAULT_ITEMS_COUNT,
        metadataFields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
        widgetOptions: {
          viewMode: CHART_MODES.BAR_VIEW,
          launchNameFilter: false,
        },
      },
      filterId: [],
    });
  }

  formatLaunchNameOptions = (values) => values.map((value) => ({ value, label: value }));

  formatLaunchNames = (value) => (value ? { value, label: value } : null);
  parseLaunchNames = (value) => (value ? value.value : undefined);

  render() {
    const {
      intl: { formatMessage },
      launchNamesSearchUrl,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="contentParameters.widgetOptions.launchNameFilter"
          format={this.formatLaunchNames}
          parse={this.parseLaunchNames}
          validate={validators.launchNames(formatMessage)}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={formatMessage(messages.LaunchNamePlaceholder)}
            focusPlaceholder={formatMessage(messages.LaunchNameFocusPlaceholder)}
            nothingFound={formatMessage(messages.LaunchNameNoMatches)}
            minLength={3}
            async
            uri={launchNamesSearchUrl}
            makeOptions={this.formatLaunchNameOptions}
            removeSelected
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
      </Fragment>
    );
  }
}
