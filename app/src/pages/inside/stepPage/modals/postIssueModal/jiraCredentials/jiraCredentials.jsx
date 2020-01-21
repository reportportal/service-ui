/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
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
    intl: PropTypes.object.isRequired,
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
