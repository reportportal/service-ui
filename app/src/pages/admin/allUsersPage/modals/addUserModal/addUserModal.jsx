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
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { commonValidators, validateAsync } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ROLES_MAP, MEMBER, PROJECT_MANAGER } from 'common/constants/projectRoles';
import { ACCOUNT_ROLES_MAP, USER, ADMINISTRATOR } from 'common/constants/accountRoles';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { SectionHeader } from 'components/main/sectionHeader';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './addUserModal.scss';

const cx = classNames.bind(styles);

const LABEL_WIDTH = 105;

const messages = defineMessages({
  contentTitle: {
    id: 'AddUserModal.contentTitle',
    defaultMessage: 'Add new user to the project',
  },
  userLoginLabel: {
    id: 'AddUserForm.userLoginLabel',
    defaultMessage: 'Login',
  },
  userFullNameLabel: {
    id: 'AddUserForm.userFullNameLabel',
    defaultMessage: 'Full name',
  },
  userEmailLabel: {
    id: 'AddUserForm.userEmailLabel',
    defaultMessage: 'Email',
  },
  userPasswordLabel: {
    id: 'AddUserForm.userPasswordLabel',
    defaultMessage: 'Password',
  },
  userAccountRoleLabel: {
    id: 'AddUserForm.userAccountRoleLabel',
    defaultMessage: 'Account role',
  },
  userSelectAProjectLabel: {
    id: 'AddUserForm.userSelectAProjectLabel',
    defaultMessage: 'Select a project',
  },
  userProjectRoleLabel: {
    id: 'AddUserForm.userProjectRoleLabel',
    defaultMessage: 'Project role',
  },
  addUserTitle: {
    id: 'AddUserForm.addUserTitle',
    defaultMessage: 'Add user',
  },
  generatePassword: {
    id: 'AddUserForm.generatePassword',
    defaultMessage: 'Generate Password',
  },
  projectNamePlaceholder: {
    id: 'AddUserForm.projectNamePlaceholder',
    defaultMessage: 'Enter project name',
  },
});

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const passSize = 8;
  let pass = '';
  let i;
  let n;
  for (i = 0, n = chars.length; i < passSize; i += 1) {
    pass += chars.charAt(Math.floor(Math.random() * n));
  }
  return pass;
};

@withModal('allUsersAddUserModal')
@injectIntl
@reduxForm({
  form: 'addUserForm',
  initialValues: { accountRole: USER, projectRole: MEMBER },
  validate: ({ login, fullName, email, password, defaultProject }) => ({
    login: commonValidators.login(login),
    fullName: commonValidators.userName(fullName),
    email: commonValidators.email(email),
    password: commonValidators.password(password),
    defaultProject: commonValidators.requiredField(defaultProject),
  }),
  asyncValidate: ({ login, email }, dispatch, { asyncErrors }, currentField) => {
    switch (currentField) {
      case 'login':
        return validateAsync.loginUnique(login).then(({ is: isExists }) => {
          const errors = {
            ...asyncErrors,
            login: undefined,
          };
          if (isExists) {
            errors.login = 'loginDuplicateHint';
          }
          throw errors;
        });
      case 'email':
        return validateAsync.emailUnique(email).then(({ is: isExists }) => {
          const errors = {
            ...asyncErrors,
            email: undefined,
          };
          if (isExists) {
            errors.email = 'emailDuplicateHint';
          }
          throw errors;
        });
      default:
        return Promise.resolve();
    }
  },
  asyncChangeFields: ['login', 'email'],
  asyncBlurFields: ['login', 'email'], // validate on blur in case of copy-paste value
})
@connect((state) => ({
  userRole: formValueSelector('addUserForm')(state, 'accountRole'),
}))
@track()
export class AddUserModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
    dirty: PropTypes.bool,
    userRole: PropTypes.string,
  };

  static defaultProps = {
    data: {},
    handleSubmit: () => {},
    change: () => {},
    dirty: false,
    userRole: '',
  };

  onGeneratePassword = () => {
    this.props.tracking.trackEvent(
      ADMIN_ALL_USERS_PAGE_EVENTS.GENERATE_PASSWORD_BTN_ADD_USER_MODAL,
    );
    this.props.change('password', generatePassword());
  };

  onChangeAccountRole = (event, value) => {
    const role = value === ADMINISTRATOR ? PROJECT_MANAGER : MEMBER;
    this.props.change('projectRole', role);
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  render() {
    const {
      intl,
      handleSubmit,
      userRole,
      data: { onSubmit },
    } = this.props;
    return (
      <ModalLayout
        title={intl.formatMessage(messages.addUserTitle)}
        okButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.ADD),
          danger: false,
          onClick: (closeModal) => {
            handleSubmit((values) => {
              onSubmit(values);
              closeModal();
            })();
          },
          eventInfo: ADMIN_ALL_USERS_PAGE_EVENTS.ADD_BTN_ADD_USER_MODAL,
        }}
        cancelButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: ADMIN_ALL_USERS_PAGE_EVENTS.CANCEL_BTN_ADD_USER_MODAL,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={ADMIN_ALL_USERS_PAGE_EVENTS.CLOSE_ICON_ADD_USER_MODAL}
      >
        <form>
          <ModalField>
            <SectionHeader text={intl.formatMessage(messages.contentTitle)} />
          </ModalField>
          <ModalField label={intl.formatMessage(messages.userLoginLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="login" type="text">
              <FieldErrorHint>
                <Input maxLength={'128'} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.userFullNameLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="fullName" type="text">
              <FieldErrorHint>
                <Input maxLength={'256'} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.userEmailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="email" type="email">
              <FieldErrorHint>
                <Input maxLength={'128'} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.userAccountRoleLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="accountRole" type="text" onChange={this.onChangeAccountRole}>
              <FieldErrorHint>
                <InputDropdown options={ACCOUNT_ROLES_MAP} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.userSelectAProjectLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="defaultProject" type="text">
              <FieldErrorHint hintType="top">
                <AsyncAutocomplete
                  placeholder={intl.formatMessage(messages.projectNamePlaceholder)}
                  getURI={URLS.projectNameSearch}
                  minLength={1}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.userProjectRoleLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="projectRole" type="text">
              <FieldErrorHint>
                <InputDropdown options={ROLES_MAP} disabled={userRole === ADMINISTRATOR} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.userPasswordLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="password" type="text">
              <FieldErrorHint>
                <Input maxLength={'256'} />
              </FieldErrorHint>
            </FieldProvider>
            <span className={cx('generate-password-link')} onClick={this.onGeneratePassword}>
              {intl.formatMessage(messages.generatePassword)}
            </span>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
