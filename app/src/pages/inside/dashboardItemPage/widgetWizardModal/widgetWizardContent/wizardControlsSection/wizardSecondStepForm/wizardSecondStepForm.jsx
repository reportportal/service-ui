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
})
export class WizardSecondStepForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {};

  render() {
    const { onSubmit, handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-second-step-form')}>
        Second step in progress...
      </form>
    );
  }
}
