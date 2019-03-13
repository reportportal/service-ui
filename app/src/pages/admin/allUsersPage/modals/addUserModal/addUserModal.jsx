import React, { Component } from 'react';
import { connect } from 'react-redux';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { validate } from 'common/utils';
import { URLS } from 'common/urls';
import { ROLES_MAP, MEMBER, PROJECT_MANAGER } from 'common/constants/projectRoles';
import { ACCOUNT_ROLES_MAP, USER, ADMINISTRATOR } from 'common/constants/accountRoles';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { SectionHeader } from 'components/main/sectionHeader';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
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
    defaultMessage: 'Full Name',
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
});

const randomPassword = () => {
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
  validate: ({ login, fullName, email, password }) => ({
    login: (!login || !validate.login(login)) && 'loginHint',
    fullName: (!fullName || !validate.name(fullName)) && 'nameHint',
    email: (!email || !validate.email(email)) && 'emailHint',
    password: (!password || !validate.password(password)) && 'passwordHint',
  }),
})
@connect((state) => ({
  userRole: formValueSelector('addUserForm')(state, 'accountRole'),
}))
@track()
export class AddUserModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      getTrackingData: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
    userRole: PropTypes.string,
  };

  static defaultProps = {
    data: {},
    handleSubmit: () => {},
    change: () => {},
    userRole: '',
  };
  onGeneratePassword = () => {
    this.props.change('password', randomPassword());
  };
  onChangeAccountRole = (event, value) => {
    const role = value === ADMINISTRATOR ? PROJECT_MANAGER : MEMBER;
    this.props.change('projectRole', role);
  };
  formatProjectNameOptions = (values) =>
    values.content.map((value) => ({ value: value.projectName, label: value.projectName }));
  formatValue = (value) => (value ? { value, label: value } : null);
  parseValue = (value) => (value ? value.value : undefined);

  render() {
    const { onSubmit, title, submitText, cancelText } = this.props.data;
    const { intl, handleSubmit, userRole } = this.props;
    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          danger: false,
          onClick: (closeModal) => {
            handleSubmit((values) => {
              onSubmit(values);
              closeModal();
            })();
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
      >
        <form>
          <ModalField>
            <SectionHeader text={intl.formatMessage(messages.contentTitle)} />
          </ModalField>
          <div className="modal-content">
            <ModalField
              label={intl.formatMessage(messages.userLoginLabel)}
              labelWidth={LABEL_WIDTH}
            >
              <FieldProvider name="login" type="text">
                <FieldErrorHint>
                  <Input maxLength={128} />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
            <ModalField
              label={intl.formatMessage(messages.userFullNameLabel)}
              labelWidth={LABEL_WIDTH}
            >
              <FieldProvider name="fullName" type="text">
                <FieldErrorHint>
                  <Input maxLength={128} />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
            <ModalField
              label={intl.formatMessage(messages.userEmailLabel)}
              labelWidth={LABEL_WIDTH}
            >
              <FieldProvider name="email" type="email">
                <FieldErrorHint>
                  <Input maxLength={128} />
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
              <FieldProvider
                name="defaultProject"
                type="text"
                format={this.formatValue}
                parse={this.parseValue}
              >
                <FieldErrorHint>
                  <InputTagsSearch
                    placeholder={'Enter project name'}
                    focusPlaceholder={'Searching...'}
                    uri={URLS.allProjectsSearch()}
                    makeOptions={this.formatProjectNameOptions}
                    async
                    removeSelected
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
                  <Input maxLength={128} />
                </FieldErrorHint>
              </FieldProvider>
              <span className={cx('generate-password-link')} onClick={this.onGeneratePassword}>
                Generate password
              </span>
            </ModalField>
          </div>
        </form>
      </ModalLayout>
    );
  }
}
