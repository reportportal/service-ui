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
  turnOn: {
    id: 'NotificationsEnableForm.turnOn',
    defaultMessage: 'On',
  },
  turnOff: {
    id: 'NotificationsEnableForm.turnOff',
    defaultMessage: 'Off',
  },
});

@injectIntl
@reduxForm({
  form: 'notificationsEnableForm',
})
export class NotificationsEnableForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    readOnly: true,
  };
  getDropdownInputConfig = () => [
    {
      value: true,
      label: this.props.intl.formatMessage(messages.turnOn),
    },
    {
      value: false,
      label: this.props.intl.formatMessage(messages.turnOff),
    },
  ];

  getCustomBlock = () => ({
    node: <p>{this.props.intl.formatMessage(messages.toggleNotificationsNote)}</p>,
  });

  render() {
    const { intl, readOnly } = this.props;

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
          <InputBigSwitcher mobileDisabled />
        </FormField>
      </Fragment>
    );
  }
}
