import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { FieldArray } from 'redux-form';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
    intl: intlShape.isRequired,
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
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FieldArray name={ORGANIZATIONS_KEY} component={CategoriesList} />
      </div>
    );
  }
}
