import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { WidgetTypeSelector } from './widgetTypeSelector';
import { WIDGET_WIZARD_FORM } from '../constants';
import styles from './wizardFirstStepForm.scss';

const cx = classNames.bind(styles);

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ widgetType }) => ({
    widgetType: !widgetType && 'error',
  }),
})
export class WizardFirstStepForm extends Component {
  static propTypes = {
    widgets: PropTypes.array,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    widgets: [],
  };

  render() {
    const { handleSubmit, widgets, onSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-first-step-form')}>
        <FieldProvider name={'widgetType'}>
          <WidgetTypeSelector widgets={widgets} />
        </FieldProvider>
      </form>
    );
  }
}
