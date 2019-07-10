import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { FormField } from 'components/fields/formField';
import { LABEL_WIDTH, ENABLED_FIELD_KEY } from '../constants';

const messages = defineMessages({
  toggleNotificationsLabel: {
    id: 'NotificationsEnableForm.toggleNotificationsLabel',
    defaultMessage: 'E-mail notification',
  },
  toggleNotificationsNote: {
    id: 'NotificationsEnableForm.toggleNotificationsNote',
    defaultMessage: 'Send e-mail notifications about launches finished',
  },
  title: {
    id: 'NotificationsEnableForm.title',
    defaultMessage: 'No integrations with E-mail',
  },
});

@reduxForm({
  form: 'notificationsEnableForm',
})
@injectIntl
export class NotificationsEnableForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    readOnly: PropTypes.bool,
    isEmailPlugin: PropTypes.bool,
  };

  static defaultProps = {
    initialValues: {},
    readOnly: true,
    isEmailPlugin: true,
  };

  componentDidMount() {
    this.props.initialize(this.props.initialValues);
  }

  getCustomBlock = () => ({
    node: <p>{this.props.intl.formatMessage(messages.toggleNotificationsNote)}</p>,
  });

  render() {
    const { intl, readOnly, isEmailPlugin } = this.props;
    const titleMessage = !isEmailPlugin ? intl.formatMessage(messages.title) : '';

    return (
      <Fragment>
        <FormField
          label={intl.formatMessage(messages.toggleNotificationsLabel)}
          labelWidth={LABEL_WIDTH}
          customBlock={this.getCustomBlock()}
          name={ENABLED_FIELD_KEY}
          disabled={readOnly}
          format={Boolean}
          parse={Boolean}
        >
          <InputBigSwitcher title={titleMessage} mobileDisabled />
        </FormField>
      </Fragment>
    );
  }
}
