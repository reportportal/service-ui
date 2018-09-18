import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { Input } from 'components/inputs/input';
import { DEFAULT_JIRA_CONFIG } from '../constants';
import styles from './jiraCredentials.scss';

const cx = classNames.bind(styles);

const authTypes = [{ value: DEFAULT_JIRA_CONFIG.systemAuth, label: 'Basic' }];

const messages = defineMessages({
  authTypeLabel: {
    id: 'JiraCredentials.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
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
          name="systemAuth"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.authTypeLabel)}
          labelClassName={cx('field-title')}
        >
          <FieldErrorHint>
            <InputDropdown options={authTypes} />
          </FieldErrorHint>
        </FormField>
        <FormField
          name="username"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.usernameLabel)}
          labelClassName={cx('field-title')}
          required
          type="text"
        >
          <FieldErrorHint>
            <Input />
          </FieldErrorHint>
        </FormField>
        <FormField
          name="password"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.passwordLabel)}
          labelClassName={cx('field-title')}
          required
          type="password"
        >
          <FieldErrorHint>
            <Input />
          </FieldErrorHint>
        </FormField>
      </div>
    );
  }
}
