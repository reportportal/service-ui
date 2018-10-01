import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { arrayRemoveDoubles, validate } from 'common/utils';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
  NO_DEFECT,
} from 'common/constants/defectTypes';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import {
  LAUNCH_GRID_COLUMNS_OPTIONS,
  LAUNCH_STATUSES_OPTIONS,
  DEFECT_TYPES_GROUPS_OPTIONS,
  STATIC_CRITERIA,
  METADATA_FIELDS,
  ITEMS_INPUT_WIDTH,
} from './constants';
import { FiltersControl, DropdownControl, InputControl } from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';

const DEFECT_STATISTICS_BASE = 'statistics$defects$';
const DEFAULT_ITEMS_COUNT = '50';
const STATIC_CONTENT_FIELDS = [
  STATIC_CRITERIA.NAME,
  STATIC_CRITERIA.NUMBER,
  STATIC_CRITERIA.LAST_MODIFIED,
  STATIC_CRITERIA.STATUS,
];
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'LaunchesTableControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'LaunchesTableControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'LaunchesTableControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
  ContentFieldsValidationError: {
    id: 'LaunchesTableControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.widgetItems(value, 1, 150)) &&
    formatMessage(messages.ItemsValidationError),
  content_fields: (formatMessage) => (value) =>
    (!value || value.length === 4) && formatMessage(messages.ContentFieldsValidationError), // 4 - count of static content fields
};

@injectIntl
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    defectTypes: defectTypesSelector(state),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class LaunchesTableControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, DEFECT_TYPES_GROUPS_OPTIONS, LAUNCH_GRID_COLUMNS_OPTIONS],
      intl.formatMessage,
      { withoutNoDefect: true },
    );
    initializeWizardSecondStepForm({
      content_fields: this.parseContentFields(widgetSettings.content_fields || this.criteria),
      itemsCount: widgetSettings.itemsCount || DEFAULT_ITEMS_COUNT,
      metadata_fields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
    });
  }

  formatContentFields = (criteries) =>
    arrayRemoveDoubles(
      criteries.map(
        (criteria) =>
          criteria.indexOf(DEFECT_STATISTICS_BASE) !== -1 ? criteria.split('$')[2] : criteria,
      ),
    ).filter((criteria) => STATIC_CONTENT_FIELDS.indexOf(criteria) === -1);

  parseContentFields = (criteries) => {
    if (!criteries) {
      return this.props.widgetSettings.content_fields;
    }
    return STATIC_CONTENT_FIELDS.concat(
      criteries
        .map((criteria) => {
          const value = criteria.value || criteria;
          return [PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE, TO_INVESTIGATE, NO_DEFECT].indexOf(
            value,
          ) + 1
            ? this.props.defectTypes[value.toUpperCase()].map(
                (defect) => `${DEFECT_STATISTICS_BASE}${value}$${defect.locator}`,
              )
            : value;
        })
        .reduce((acc, val) => acc.concat(val), []),
    );
  };

  parseItems = (value) => (value.length < 4 ? value : this.props.widgetSettings.itemsCount);

  render() {
    const { intl, formAppearance, onFormAppearanceChange } = this.props;
    return (
      <Fragment>
        <FieldProvider name={'filterId'}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
        <FieldProvider
          name="content_fields"
          parse={this.parseContentFields}
          format={this.formatContentFields}
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
      </Fragment>
    );
  }
}
