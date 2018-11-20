import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_TOTAL, STATS_FAILED, STATS_SKIPPED } from 'common/constants/statistics';
import { validate } from 'common/utils';
import { ITEMS_INPUT_WIDTH, METADATA_FIELDS } from './constants';
import { FiltersControl, InputControl } from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'NotPassedTestCasesTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'NotPassedTestCasesTrendControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 150)) &&
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
export class NotPassedTestCasesTrendControls extends Component {
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
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [STATS_FAILED, STATS_SKIPPED, STATS_TOTAL],
        itemsCount: DEFAULT_ITEMS_COUNT,
        metadataFields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
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
      </Fragment>
    );
  }
}
