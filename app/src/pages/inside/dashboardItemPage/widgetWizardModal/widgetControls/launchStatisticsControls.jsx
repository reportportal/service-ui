import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { defectTypesSelector } from 'controllers/project';
import { FieldProvider } from 'components/fields/fieldProvider';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { validate } from 'common/utils';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import {
  LAUNCH_STATUSES_OPTIONS,
  GROUPED_DEFECT_TYPES_OPTIONS,
  ITEMS_INPUT_WIDTH,
  CHART_MODES,
  METADATA_FIELDS,
} from './constants';
import {
  FiltersControl,
  DropdownControl,
  InputControl,
  TogglerControl,
  CheckboxControl,
} from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'LaunchStatisticsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'LaunchStatisticsControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ZoomControlText: {
    id: 'LaunchStatisticsControls.ZoomControlText',
    defaultMessage: 'Zoom widget area',
  },
  ItemsValidationError: {
    id: 'LaunchStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
  ContentFieldsValidationError: {
    id: 'LaunchStatisticsControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 150)) &&
    formatMessage(messages.ItemsValidationError),
  contentFields: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.ContentFieldsValidationError),
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
export class LaunchStatisticsControls extends Component {
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
    const { intl, widgetSettings, defectTypes, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, GROUPED_DEFECT_TYPES_OPTIONS],
      intl.formatMessage,
      { defectTypes },
    );
    initializeWizardSecondStepForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: this.criteria.map((criteria) => criteria.value),
        itemsCount: DEFAULT_ITEMS_COUNT,
        metadataFields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
        widgetOptions: {
          zoom: false,
          mode: CHART_MODES.LAUNCH_MODE,
          viewMode: CHART_MODES.AREA_VIEW,
        },
      },
    });
  }

  parseItems = (value) =>
    value.length < 4 ? value : this.props.widgetSettings.contentParameters.itemsCount;

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="filterId"
          parse={this.parseFilterValue}
          format={this.formatFilterValue}
        >
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
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
          name="contentParameters.itemsCount"
          validate={validators.items(formatMessage)}
          parse={this.parseItems}
        >
          <InputControl
            fieldLabel={formatMessage(messages.ItemsFieldLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            type="number"
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.mode">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.LAUNCH_MODE, CHART_MODES.TIMELINE_MODE],
              formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.viewMode">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.AREA_VIEW, CHART_MODES.BAR_VIEW],
              formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.zoom">
          <CheckboxControl fieldLabel=" " text={formatMessage(messages.ZoomControlText)} />
        </FieldProvider>
      </Fragment>
    );
  }
}
