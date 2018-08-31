import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, reduxForm } from 'redux-form';
import { projectEmailCasesSelector } from 'controllers/project/index';
import { connect } from 'react-redux';
import { EmailCaseList } from './emailCaseList';
import { validate } from './validation';

@connect((state) => ({
  initialValues: {
    emailCases: projectEmailCasesSelector(state),
  },
}))
@reduxForm({
  destroyOnUnmount: false,
  form: 'EmailCaseForm',
  validate,
})
export class EmailCaseForm extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    readOnly: false,
  };
  render() {
    const { readOnly } = this.props;
    return (
      <Fragment>
        <FieldArray
          name="emailCases"
          component={EmailCaseList}
          rerenderOnEveryChange
          readOnly={readOnly}
        />
      </Fragment>
    );
  }
}
