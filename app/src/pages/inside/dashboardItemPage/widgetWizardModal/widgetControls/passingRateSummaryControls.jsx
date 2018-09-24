import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { STATS_TOTAL, STATS_PASSED } from 'common/constants/statistics';
import { validate } from 'common/utils';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { METADATA_FIELDS, CHART_MODES, ITEMS_INPUT_WIDTH } from './constants';
import { TogglerControl, FiltersControl, InputControl } from './controls';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'PassingRateSummaryControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'PassingRateSummaryControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.widgetItems(value, 1, 150)) &&
    formatMessage(messages.ItemsValidationError),
};

@injectIntl
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class PassingRateSummaryControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeWizardSecondStepForm } = props;
    initializeWizardSecondStepForm({
      content_fields: [STATS_TOTAL, STATS_PASSED],
      itemsCount: widgetSettings.itemsCount || DEFAULT_ITEMS_COUNT,
      viewMode: widgetSettings.viewMode || CHART_MODES.BAR_VIEW,
      metadata_fields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
    });
  }

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
        <FieldProvider name="viewMode">
          <TogglerControl
            fieldLabel={' '}
            items={getWidgetModeOptions(
              [CHART_MODES.BAR_VIEW, CHART_MODES.PIE_VIEW],
              intl.formatMessage,
            )}
          />
        </FieldProvider>
      </Fragment>
    );
  }
}
