import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import styles from './jiraCredentials.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  usernameLabel: {
    id: 'JiraCredentials.usernameLabel',
    defaultMessage: 'BTS username',
  },
  passwordLabel: {
    id: 'JiraCredentials.passwordLabel',
    defaultMessage: 'BTS password',
  },
});

@injectIntl
export class JiraCredentials extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;
    return (
      <div className={cx('jira-credentials')}>
        <FormField
          name="username"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.usernameLabel)}
          labelClassName={cx('field-title')}
          required
        >
          <FieldErrorHint>
            <Input type="text" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name="password"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.passwordLabel)}
          labelClassName={cx('field-title')}
          required
        >
          <FieldErrorHint>
            <Input type="password" mobileDisabled />
          </FieldErrorHint>
        </FormField>
      </div>
    );
  }
}
