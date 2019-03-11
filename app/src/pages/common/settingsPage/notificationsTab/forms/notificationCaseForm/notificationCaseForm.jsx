import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, reduxForm } from 'redux-form';
import { NotificationCaseList } from './notificationCaseList';
import { validate } from './validation';

@reduxForm({
  destroyOnUnmount: false,
  form: 'notificationCaseForm',
  validate,
})
export class NotificationCaseForm extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    readOnly: false,
  };

  render() {
    const { readOnly } = this.props;

    return (
      <FieldArray
        name="cases"
        component={NotificationCaseList}
        rerenderOnEveryChange
        readOnly={readOnly}
      />
    );
  }
}
