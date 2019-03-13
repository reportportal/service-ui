import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import styles from './sauceLabsFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  userNameTitle: {
    id: 'SauceLabsFormFields.userNameTitle',
    defaultMessage: 'User name',
  },
  accessTokenTitle: {
    id: 'SauceLabsFormFields.accessTokenTitle',
    defaultMessage: 'Access token',
  },
});

const validators = {
  requiredField: (value) => (!value && 'requiredFieldHint') || undefined,
};

@injectIntl
export class SauceLabsFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
    } = this.props;

    return (
      <div className={cx('sauce-labs-form-fields')}>
        <div className={cx('form-field-wrapper', { 'line-align': lineAlign })}>
          <span className={cx('form-field-label')}>{formatMessage(messages.userNameTitle)}</span>
          <div className={cx('form-field')}>
            <FieldProvider disabled={disabled} name="username" validate={validators.requiredField}>
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </FieldProvider>
          </div>
        </div>

        <div className={cx('form-field-wrapper', { 'line-align': lineAlign })}>
          <span className={cx('form-field-label')}>{formatMessage(messages.accessTokenTitle)}</span>
          <div className={cx('form-field')}>
            <FieldProvider
              disabled={disabled}
              name="accessToken"
              validate={validators.requiredField}
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </FieldProvider>
          </div>
        </div>
      </div>
    );
  }
}
