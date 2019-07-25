import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, initialize, getFormValues } from 'redux-form';
import PropTypes from 'prop-types';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filters }) => ({
    filters: (!filters || !filters.length) && 'error',
  }),
})
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class WizardSecondStepForm extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDisableButtons: PropTypes.func.isRequired,
  };

  static defaultProps = {
    handleSubmit: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      formAppearance: {
        mode: false,
        isMainControlsLocked: false,
        filter: {},
      },
    };
  }

  handleFormAppearanceChange = (mode, filter) => {
    const { onDisableButtons } = this.props;

    this.setState({ formAppearance: { mode, filter, isMainControlsLocked: !!mode } });
    onDisableButtons(mode !== false);
  };

  render() {
    const {
      onSubmit,
      handleSubmit,
      widget,
      initializeWizardSecondStepForm,
      widgetSettings,
    } = this.props;
    const { formAppearance } = this.state;
    const ControlsForm = widget.controls;

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <ControlsForm
          widgetType={widget.id}
          formAppearance={formAppearance}
          onFormAppearanceChange={this.handleFormAppearanceChange}
          initializeControlsForm={initializeWizardSecondStepForm}
          widgetSettings={widgetSettings}
        />
      </form>
    );
  }
}
