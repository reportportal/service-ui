import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { activeProjectSelector } from 'controllers/user';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import {
  SKIPPED_FAILED_LAUNCHES_OPTIONS,
  DEFECT_STATISTICS_OPTIONS,
  ITEMS_INPUT_WIDTH,
  METADATA_FIELDS,
} from './constants';
import {
  FiltersControl,
  DropdownControl,
  InputControl,
  TagsControl,
  CheckboxControl,
} from './controls';

const DEFAULT_ITEMS_COUNT = '30';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'MostFailedTestCasesTableControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'MostFailedTestCasesTableControls.ItemsFieldLabel',
    defaultMessage: 'Launches count',
  },
  LaunchNameFieldLabel: {
    id: 'MostFailedTestCasesTableControls.LaunchNameFieldLabel',
    defaultMessage: 'Launch name',
  },
  LaunchNamePlaceholder: {
    id: 'MostFailedTestCasesTableControls.LaunchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  LaunchNameFocusPlaceholder: {
    id: 'MostFailedTestCasesTableControls.LaunchNameFocusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
  LaunchNameNoMatches: {
    id: 'MostFailedTestCasesTableControls.LaunchNameNoMatches',
    defaultMessage: 'No matches found.',
  },
  IncludeMethodsControlText: {
    id: 'MostFailedTestCasesTableControls.IncludeMethodsControlText',
    defaultMessage: 'Include Before and After methods',
  },
  ItemsValidationError: {
    id: 'MostFailedTestCasesTableControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 2 to 150',
  },
  LaunchNamesValidationError: {
    id: 'MostFailedTestCasesTableControls.LaunchNamesValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.widgetItems(value, 2, 150)) &&
    formatMessage(messages.ItemsValidationError),
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
export class MostFailedTestCasesTableControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    launchNamesSearchUrl: PropTypes.string.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [SKIPPED_FAILED_LAUNCHES_OPTIONS, DEFECT_STATISTICS_OPTIONS],
      intl.formatMessage,
    );
    initializeWizardSecondStepForm({
      content_fields: widgetSettings.content_fields || [this.criteria[0].value],
      itemsCount: widgetSettings.itemsCount || DEFAULT_ITEMS_COUNT,
      include_methods: !!widgetSettings.include_methods,
      launchNameFilter: !!widgetSettings.launchNameFilter,
      metadata_fields: [METADATA_FIELDS.NAME, METADATA_FIELDS.START_TIME],
      filter_id: '',
    });
  }

  formatContentFields = (value) => value[0];
  parseContentFields = (value) => (value ? [value] : this.props.widgetSettings.content_fields);

  parseItems = (value) => (value.length < 4 ? value : this.props.widgetSettings.itemsCount);

  formatLaunchNameOptions = (values) => values.map((value) => ({ value, label: value }));
  formatLaunchNames = (value) => (value ? { value, label: value } : null);
  parseLaunchNames = (value) => (value ? value.value : null);

  render() {
    const { intl, launchNamesSearchUrl } = this.props;
    return (
      <Fragment>
        <FiltersControl />
        <FieldProvider
          name="content_fields"
          format={this.formatContentFields}
          parse={this.parseContentFields}
        >
          <DropdownControl
            fieldLabel={intl.formatMessage(messages.CriteriaFieldLabel)}
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider
          name="itemsCount"
          validate={validators.items(intl.formatMessage)}
          parse={this.parseItems}
        >
          <InputControl
            fieldLabel={intl.formatMessage(messages.ItemsFieldLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            type="number"
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
