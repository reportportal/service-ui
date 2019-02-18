import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { reduxForm, initialize } from 'redux-form';
import PropTypes from 'prop-types';
import { CommonWidgetControls } from '../../../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})
@connect(null, {
  initializeWizardThirdStepForm: (data) =>
    initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
})
@track()
export class WizardThirdStepForm extends Component {
  static propTypes = {
    initializeWizardThirdStepForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    widgetTitle: PropTypes.string,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    eventsInfo: {},
    widgetTitle: '',
    onSubmit: () => {},
  };

  getUniqPostfix = () =>
    new Date()
      .valueOf()
      .toString()
      .slice(-3);

  initializeControlsForm = (
    data = {
      name: `${this.props.widgetTitle}_${this.getUniqPostfix()}`,
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
