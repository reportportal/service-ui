import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { activeProjectSelector } from 'controllers/user';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { URLS } from 'common/urls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { PASSED_FAILED_LAUNCHES_OPTIONS, CHART_MODES, METADATA_FIELDS } from './constants';
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
  LaunchNameFocusPlaceholder: {
    id: 'MostTimeConsumingTestCasesControls.LaunchNameFocusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
  LaunchNameNoMatches: {
    id: 'MostTimeConsumingTestCasesControls.LaunchNameNoMatches',
    defaultMessage: 'No matches found.',
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
  content_fields: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.ContentFieldsValidationError),
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
export class MostTimeConsumingTestCasesControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    launchNamesSearchUrl: PropTypes.string.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions([PASSED_FAILED_LAUNCHES_OPTIONS], intl.formatMessage);
    initializeWizardSecondStepForm({
      content_fields:
        widgetSettings.content_fields || this.criteria.map((criteria) => criteria.value),
      include_methods: !!widgetSettings.include_methods,
      launchNameFilter: !!widgetSettings.launchNameFilter,
      viewMode: widgetSettings.viewMode || CHART_MODES.BAR_VIEW,
      metadata_fields: [METADATA_FIELDS.NAME, METADATA_FIELDS.START_TIME],
      filter_id: '',
    });
  }

  formatLaunchNameOptions = (values) => values.map((value) => ({ value, label: value }));
  formatLaunchNames = (value) => (value ? { value, label: value } : null);
  parseLaunchNames = (value) => (value ? value.value : null);

  render() {
    const { intl, launchNamesSearchUrl } = this.props;
    return (
      <Fragment>
        <FieldProvider
          name="content_fields"
          validate={validators.content_fields(intl.formatMessage)}
        >
          <DropdownControl
            fieldLabel={intl.formatMessage(messages.CriteriaFieldLabel)}
            multiple
            selectAll
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider
          name="launchNameFilter"
          format={this.formatLaunchNames}
          parse={this.parseLaunchNames}
          validate={validators.launchNames(intl.formatMessage)}
        >
          <TagsControl
            fieldLabel={intl.formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={intl.formatMessage(messages.LaunchNamePlaceholder)}
            focusPlaceholder={intl.formatMessage(messages.LaunchNameFocusPlaceholder)}
            nothingFound={intl.formatMessage(messages.LaunchNameNoMatches)}
            minLength={3}
            async
            uri={launchNamesSearchUrl}
            makeOptions={this.formatLaunchNameOptions}
            removeSelected
          />
        </FieldProvider>
        <FieldProvider name="viewMode">
          <TogglerControl
            fieldLabel={' '}
            items={getWidgetModeOptions(
              [CHART_MODES.BAR_VIEW, CHART_MODES.TABLE_VIEW],
              intl.formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider name="include_methods">
          <CheckboxControl
            fieldLabel={' '}
            text={intl.formatMessage(messages.IncludeMethodsControlText)}
          />
        </FieldProvider>
      </Fragment>
    );
  }
}
