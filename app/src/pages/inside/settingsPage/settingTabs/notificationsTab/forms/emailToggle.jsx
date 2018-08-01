import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { labelWidth } from './constants';
import { emailToggleMessages } from './messages';
import styles from './forms.scss';

const cx = classNames.bind(styles);

@injectIntl
@reduxForm({
  form: 'toggleEmailNotification',
  onChange: (values, dispatch, props) => {
    props.submit();
  },
})
export class EmailToggle extends Component {
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
      label: this.props.intl.formatMessage(emailToggleMessages.turnOn),
    },
    {
      value: false,
      label: this.props.intl.formatMessage(emailToggleMessages.turnOff),
    },
  ];

  render() {
    const { intl } = this.props;
    return (
      <Fragment>
        <div className={cx('email-notification-toggle--desktop')}>
          <FormField
            label={intl.formatMessage(emailToggleMessages.toggleNotificationsLabel)}
            labelWidth={labelWidth}
            description={intl.formatMessage(emailToggleMessages.toggleNotificationsNote)}
            name="emailEnabled"
            format={Boolean}
            parse={Boolean}
          >
            <InputBigSwitcher disabled={this.props.readOnly} />
          </FormField>
        </div>
        <div className={cx('email-notification-toggle--mobile')}>
          <FormField
            label={intl.formatMessage(emailToggleMessages.toggleNotificationsLabel)}
            description={intl.formatMessage(emailToggleMessages.toggleNotificationsNote)}
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
