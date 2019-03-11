import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { labelWidth } from 'pages/common/settingsPage/notificationsTab/forms/constants';
import styles from './notificationsEnableForm.scss';

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
const cx = classNames.bind(styles);

@injectIntl
@reduxForm({
  form: 'notificationsEnableForm',
  destroyOnUnmount: false,
})
export class NotificationsEnableForm extends Component {
  static propTypes = {
    initialize: PropTypes.func,
    enabled: PropTypes.object,
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    initialize: () => {},
    enabled: {},
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

  render() {
    const { intl, readOnly } = this.props;
    return (
      <Fragment>
        <div className={cx('email-notification-toggle--desktop')}>
          <FormField
            label={intl.formatMessage(messages.toggleNotificationsLabel)}
            labelWidth={labelWidth}
            customBlock={{
              node: <p>{intl.formatMessage(messages.toggleNotificationsNote)}</p>,
            }}
            name="enabled"
            disabled={readOnly}
            format={Boolean}
            parse={Boolean}
          >
            <InputBigSwitcher />
          </FormField>
        </div>
        <div className={cx('email-notification-toggle--mobile')}>
          <FormField
            label={intl.formatMessage(messages.toggleNotificationsLabel)}
            customBlock={{
              node: <p>{intl.formatMessage(messages.toggleNotificationsNote)}</p>,
            }}
            name="enabled"
            fieldWrapperClassName={cx('form-input')}
          >
            <InputDropdown options={this.getDropdownInputConfig()} />
          </FormField>
        </div>
      </Fragment>
    );
  }
}
