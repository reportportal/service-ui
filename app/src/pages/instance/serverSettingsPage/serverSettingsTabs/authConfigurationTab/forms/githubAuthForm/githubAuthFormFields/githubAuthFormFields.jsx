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
import classNames from 'classnames/bind';
import { FieldArray } from 'redux-form';
import { defineMessages, injectIntl } from 'react-intl';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { CLIENT_ID_KEY, CLIENT_SECRET_KEY, ORGANIZATIONS_KEY } from '../constants';
import { CategoriesList } from './categoriesList';
import styles from './githubAuthFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  clientIdLabel: {
    id: 'GithubAuthFormFields.clientIdLabel',
    defaultMessage: 'Client ID',
  },
  clientSecretLabel: {
    id: 'GithubAuthFormFields.clientSecretLabel',
    defaultMessage: 'Client secret',
  },
});

@injectIntl
export class GithubAuthFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('github-auth-form-fields')}>
        <FormField
          name={CLIENT_ID_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.clientIdLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={CLIENT_SECRET_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.clientSecretLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input type="password" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FieldArray name={ORGANIZATIONS_KEY} component={CategoriesList} />
      </div>
    );
  }
}
