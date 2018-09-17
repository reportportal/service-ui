import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { labelWidth } from 'pages/inside/settingsPage/settingTabs/notificationsTab/forms/constants';
import styles from './emailEnableForm.scss';

const messages = defineMessages({
  toggleNotificationsLabel: {
    id: 'EmailEnableForm.toggleNotificationsLabel',
    defaultMessage: 'E-mail notification',
  },
  toggleNotificationsNote: {
    id: 'EmailEnableForm.toggleNotificationsNote',
    defaultMessage: 'Send e-mail notifications about launches finished',
  },
  turnOn: {
    id: 'EmailEnableForm.turnOn',
    defaultMessage: 'On',
  },
  turnOff: {
    id: 'EmailEnableForm.turnOff',
    defaultMessage: 'Off',
  },
});
const cx = classNames.bind(styles);

@injectIntl
@reduxForm({
  form: 'toggleEmailNotification',
  onChange: (values, dispatch, props) => {
    props.submit();
  },
  destroyOnUnmount: false,
})
export class EmailEnableForm extends Component {
  static propTypes = {
    initialize: PropTypes.func,
    emailEnabled: PropTypes.object,
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    initialize: () => {},
    emailEnabled: {},
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
            description={intl.formatMessage(messages.toggleNotificationsNote)}
            name="emailEnabled"
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
            description={intl.formatMessage(messages.toggleNotificationsNote)}
            name="emailEnabled"
            fieldWrapperClassName={cx('form-input')}
          >
            <InputDropdown options={this.getDropdownInputConfig()} />
          </FormField>
        </div>
      </Fragment>
    );
  }
}
