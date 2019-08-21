import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { FieldProvider } from 'components/fields/fieldProvider';
import { URLS } from 'common/urls';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { ENTITY_START_TIME, ENTITY_STATUS } from 'components/filterEntities/constants';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { activeProjectSelector } from 'controllers/user';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { GROUPED_DEFECT_TYPES_OPTIONS } from './constants';
import {
  DropdownControl,
  TogglerControl,
  CheckboxControl,
  TagsControl,
  CustomColumnsControl,
} from './controls';

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
    defaultMessage: 'Please enter 3 or more characters',
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

const PRODUCT_BUG = 'statistics$defects$product_bug$pb001';
const AUTOMATION_BUG = 'statistics$defects$automation_bug$ab001';
const SYSTEM_ISSUE = 'statistics$defects$system_issue$si001';
const NO_DEFECT = 'statistics$defects$no_defect$nd001';
const TO_INVESTIGATE = 'statistics$defects$to_investigate$ti001';
const STATIC_BASE_COLUMNS = [STATS_TOTAL, STATS_PASSED, STATS_FAILED, STATS_SKIPPED];
const BASE_COLUMNS_ORDER = [
  ENTITY_START_TIME,
  ENTITY_STATUS,
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
];
const validators = {
  filters: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.FiltersValidationError),
  customColumns: (value = []) =>
    new Set(value.map((item) => item.name)).size !== value.length
      ? 'customColumnsDuplicationHint'
      : undefined,
};

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
  filtersSearchUrl: URLS.filtersSearch(activeProjectSelector(state)),
  attributesSearchUrl: URLS.launchAttributeKeysSearch(activeProjectSelector(state)),
}))
export class ProductStatusControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    filtersSearchUrl: PropTypes.string.isRequired,
    attributesSearchUrl: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, defectTypes, widgetSettings, initializeControlsForm } = props;
    this.criteria = [
      { value: ENTITY_START_TIME, label: props.intl.formatMessage(messages.StartTimeCriteria) },
      { value: ENTITY_STATUS, label: props.intl.formatMessage(messages.StatusCriteria) },
    ].concat(
      getWidgetCriteriaOptions([GROUPED_DEFECT_TYPES_OPTIONS], intl.formatMessage, { defectTypes }),
    );
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        contentFields: this.parseBasicColumns(this.criteria.map((criteria) => criteria.value)),
        widgetOptions: {
          customColumns: [{ name: '', value: '' }],
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
          group: false,
          strategy: 'filter',
        },
      },
      filters: [],
    });
  }

  formatFilterOptions = (values) =>
    values.content.map((value) => ({ value: value.id, label: value.name }));

  formatFilters = (values) => values.map((value) => ({ value: value.value, label: value.name }));

  parseFilters = (values) =>
    values.length > 0
      ? values && values.map((value) => ({ value: value.value, name: value.label }))
      : [];

  formatBasicColumns = (values) =>
    values.filter((value) => STATIC_BASE_COLUMNS.indexOf(value) === -1);

  parseBasicColumns = (values) => {
    if (!values) {
      return this.props.widgetSettings.contentParameters.contentFields;
    }
    return BASE_COLUMNS_ORDER.filter(
      (column) => STATIC_BASE_COLUMNS.indexOf(column) !== -1 || values.indexOf(column) !== -1,
    );
  };

  formatCustomColumns = (values) =>
    values.map((item) => ({
      ...item,
      value: item.value ? { value: item.value, label: item.value } : null,
    }));

  parseCustomColumns = (values) =>
    values.map((item) => ({ ...item, value: (item.value && item.value.value) || '' }));

  render() {
    const {
      intl: { formatMessage },
      filtersSearchUrl,
      attributesSearchUrl,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="filters"
          format={this.formatFilters}
          parse={this.parseFilters}
          validate={validators.filters(formatMessage)}
          dumbOnBlur
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
          name="contentParameters.contentFields"
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
        <FieldProvider
          name="contentParameters.widgetOptions.customColumns"
          format={this.formatCustomColumns}
          parse={this.parseCustomColumns}
          validate={validators.customColumns}
        >
          <CustomColumnsControl uri={attributesSearchUrl} />
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
