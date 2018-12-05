import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import { WIDGET_WIZARD_FORM } from '../constants';
import styles from './wizardSecondStepForm.scss';

const cx = classNames.bind(styles);

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filterIds }) => ({
    filterIds: (!filterIds || !filterIds.length) && 'error',
  }),
})
export class WizardSecondStepForm extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
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
        filter: {},
      },
    };
  }

  handleFormAppearanceChange = (mode, filter) => {
    const { onDisableButtons } = this.props;

    this.setState({ formAppearance: { mode, filter } });
    onDisableButtons(mode !== false);
  };

  render() {
    const { onSubmit, handleSubmit, widget } = this.props;
    const { formAppearance } = this.state;
    const ControlsForm = widget.controls;

    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-second-step-form')}>
        <ControlsForm
          widgetType={widget.id}
          formAppearance={formAppearance}
          onFormAppearanceChange={this.handleFormAppearanceChange}
        />
      </form>
    );
  }
}
