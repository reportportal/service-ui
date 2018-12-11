import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, reduxForm } from 'redux-form';
import { notificationRulesSelector } from 'controllers/project';
import { connect } from 'react-redux';
import { NotificationRuleList } from './notificationRuleList';
import { validate } from './validation';

@connect((state) => ({
  initialValues: {
    rules: notificationRulesSelector(state),
  },
}))
@reduxForm({
  destroyOnUnmount: false,
  form: 'notificationRuleForm',
  validate,
})
export class NotificationRuleForm extends Component {
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
        name="rules"
        component={NotificationRuleList}
        rerenderOnEveryChange
        readOnly={readOnly}
      />
    );
  }
}
