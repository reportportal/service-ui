import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { URLS } from 'common/urls';
import { FAILED, PASSED, SKIPPED } from 'common/constants/launchStatuses';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { activeProjectSelector } from 'controllers/user';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { DEFECT_TYPES_GROUPS_OPTIONS } from './constants';
import {
  DropdownControl,
  TogglerControl,
  CheckboxControl,
  TagsControl,
  CustomColumnsControl,
} from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  BasicColumnsFieldLabel: {
    id: 'ProductStatusControls.BasicColumnsFieldLabel',
    defaultMessage: 'Basic columns',
  },
  GroupControlText: {
    id: 'ProductStatusControls.GroupControlText',
    defaultMessage: 'Group launches by filter',
  },
  FiltersFieldLabel: {
    id: 'ProductStatusControls.FiltersFieldLabel',
    defaultMessage: 'Filters',
  },
  FiltersPlaceholder: {
    id: 'ProductStatusControls.FiltersPlaceholder',
    defaultMessage: 'Enter filter names',
  },
  FiltersFocusPlaceholder: {
    id: 'ProductStatusControls.FiltersFocusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
  FiltersNoMatches: {
    id: 'ProductStatusControls.FiltersNoMatches',
    defaultMessage: 'No matches found.',
  },
  StartTimeCriteria: {
    id: 'ProductStatusControls.StartTimeCriteria',
    defaultMessage: 'Start time',
  },
  StatusCriteria: {
    id: 'ProductStatusControls.StatusCriteria',
    defaultMessage: 'Status',
  },
  FiltersValidationError: {
    id: 'ProductStatusControls.FiltersValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const PASSING_RATE = 'passingRate';
const TOTAL = 'total';
const START_TIME = 'startTime';
const STATUS = 'status';
const STATIC_BASE_COLUMNS = [TOTAL, PASSED, FAILED, SKIPPED, PASSING_RATE];
const BASE_COLUMNS_ORDER = [
  START_TIME,
  STATUS,
  TOTAL,
  PASSED,
  FAILED,
  SKIPPED,
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
  PASSING_RATE,
];
const validators = {
  filterIds: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.FiltersValidationError),
};

@injectIntl
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    filtersSearchUrl: URLS.filtersSearch(activeProjectSelector(state)),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class ProductStatusControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    filtersSearchUrl: PropTypes.string.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeWizardSecondStepForm } = props;
    this.criteria = [
      { value: START_TIME, label: props.intl.formatMessage(messages.StartTimeCriteria) },
      { value: STATUS, label: props.intl.formatMessage(messages.StatusCriteria) },
    ].concat(getWidgetCriteriaOptions([DEFECT_TYPES_GROUPS_OPTIONS], intl.formatMessage));
    initializeWizardSecondStepForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          basicColumns: this.parseBasicColumns(this.criteria.map((criteria) => criteria.value)),
          customColumns: [{ name: '', value: '' }],
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
          group: false,
        },
      },
      filterIds: [],
    });
  }

  formatFilterOptions = (values) =>
    values.content.map((value) => ({ value: value.id, label: value.name }));
  formatFilters = (values) => values.map((value) => ({ value, label: value.name }));
  parseFilters = (values) =>
    (values && values.map((value) => ({ value: value.value, name: value.label }))) || undefined;

  formatBasicColumns = (values) =>
    values.filter((value) => STATIC_BASE_COLUMNS.indexOf(value) === -1);
  parseBasicColumns = (values) => {
    if (!values) {
      return this.props.widgetSettings.contentParameters.widgetOptions.basicColumns;
    }
    return BASE_COLUMNS_ORDER.filter(
      (column) => STATIC_BASE_COLUMNS.indexOf(column) !== -1 || values.indexOf(column) !== -1,
    );
  };

  render() {
    const {
      intl: { formatMessage },
      filtersSearchUrl,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="filterIds"
          format={this.formatFilters}
          parse={this.parseFilters}
          validate={validators.filterIds(formatMessage)}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.FiltersFieldLabel)}
            placeholder={formatMessage(messages.FiltersPlaceholder)}
            focusPlaceholder={formatMessage(messages.FiltersFocusPlaceholder)}
            nothingFound={formatMessage(messages.FiltersNoMatches)}
            minLength={3}
            async
            multi
            uri={filtersSearchUrl}
            makeOptions={this.formatFilterOptions}
            removeSelected
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.basicColumns"
          format={this.formatBasicColumns}
          parse={this.parseBasicColumns}
        >
          <DropdownControl
            fieldLabel={formatMessage(messages.BasicColumnsFieldLabel)}
            multiple
            selectAll
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.customColumns">
          <CustomColumnsControl />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.latest">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
              formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.group">
          <CheckboxControl fieldLabel=" " text={formatMessage(messages.GroupControlText)} />
        </FieldProvider>
      </Fragment>
    );
  }
}
