import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, initialize } from 'redux-form';
import PropTypes from 'prop-types';
import { CommonWidgetControls } from '../../../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';

const WIDGET_NAME_PART_LIMIT = 124;

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})
@connect(
  (state) => ({
    formValues: getFormValues(WIDGET_WIZARD_FORM)(state),
  }),
  {
    initializeWizardThirdStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
@track()
export class WizardThirdStepForm extends Component {
  static propTypes = {
    initializeWizardThirdStepForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    formValues: PropTypes.object,
    widgetTitle: PropTypes.string,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    eventsInfo: {},
    formValues: {},
    widgetTitle: '',
    onSubmit: () => {},
  };

  getUniqPostfix = () =>
    new Date()
      .valueOf()
      .toString()
      .slice(-3);

  generateWidgetName = () => {
    const {
      filterIds,
      contentParameters: {
        widgetOptions: { launchNameFilter },
      },
    } = this.props.formValues;
    const filterBasedName =
      (filterIds.length &&
        filterIds.reduce((acc, item) => `${acc}${acc.length ? '.' : ''}${item.name}`, '')) ||
      '';
    let generatedName = filterBasedName || launchNameFilter || this.props.widgetTitle;
    if (generatedName.length > WIDGET_NAME_PART_LIMIT) {
      generatedName = generatedName.substring(0, WIDGET_NAME_PART_LIMIT);
    }

    return `${generatedName}_${this.getUniqPostfix()}`;
  };

  initializeControlsForm = (
    data = {
      name: this.generateWidgetName(),
      description: '',
      share: false,
    },
  ) => this.props.initializeWizardThirdStepForm(data);

  render() {
    const { handleSubmit, onSubmit, tracking, eventsInfo } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <CommonWidgetControls
          initializeControlsForm={this.initializeControlsForm}
          trackEvent={tracking.trackEvent}
          eventsInfo={eventsInfo}
        />
      </form>
    );
  }
}
