import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { defectTypesSelector } from 'controllers/project';
import { FiltersControl } from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';
import { DEFECT_TYPES_OPTIONS, LAUNCH_STATUSES_OPTIONS, METADATA_FIELDS } from './constants';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';

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
export class LaunchExecutionAndIssueStatisticsControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, defectTypes, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, DEFECT_TYPES_OPTIONS],
      intl.formatMessage,
      { defectTypes },
    );
    initializeWizardSecondStepForm({
      content_fields: widgetSettings.criteria || this.criteria.map((criteria) => criteria.value),
      itemsCount: 1,
      metadata_fields: [METADATA_FIELDS.NAME, METADATA_FIELDS.NUMBER, METADATA_FIELDS.START_TIME],
    });
  }

  render() {
    return (
      <Fragment>
        <FieldProvider name={'filterId'}>
          <FiltersControl />
        </FieldProvider>
      </Fragment>
    );
  }
}
