import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_PROJECT_ROLE, ROLES_MAP } from 'common/constants/projectRoles';
import { withModal, ModalLayout, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { showModalAction } from 'controllers/modal';
import { InputUserSearch } from 'components/inputs/inputUserSearch';
import { InputDropdown } from 'components/inputs/inputDropdown';
import classNames from 'classnames/bind';
import { activeProjectSelector, isAdminSelector } from 'controllers/user';
import styles from './inviteUserModal.scss';

const cx = classNames.bind(styles);
const LABEL_WIDTH = 105;
const messages = defineMessages({
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage: 'Invite user to the project',
  },
  emailLabel: {
    id: 'InviteUserModal.emailLabel',
    defaultMessage: 'Login or email',
  },
  role: {
    id: 'InviteUserModal.role',
    defaultMessage: 'Project role',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter login or email',
  },
});

@withModal('inviteUserModal')
@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    isAdmin: isAdminSelector(state),
  }),
  { showModalAction },
)
@reduxForm({
  form: 'inviteUserForm',
  validate: ({ user }) => ({ user: !user }),
  initialValues: {
    role: DEFAULT_PROJECT_ROLE,
  },
})
export class InviteUserModal extends Component {
  static propTypes = {
    intl: intlShape,
    data: PropTypes.shape({
      onInvite: PropTypes.func,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    activeProject: PropTypes.string,
    isAdmin: PropTypes.bool,
  };
  static defaultProps = {
    intl: {},
    showModalAction: () => {},
    activeProject: '',
    isAdmin: false,
  };
  inviteUserAndCloseModal = (closeModal) => (data) => {
    this.props.data.onInvite(data).then((res) => {
      closeModal();
      if (data.user.externalUser) {
        this.props.showModalAction({
          id: 'externalUserInvitationModal',
          data: { email: res.email, link: res.backLink },
        });
      }
    });
  };
  formatUser = (user) => (user && { value: user.userLogin, label: user.userLogin }) || null;
  render() {
    const { intl, handleSubmit, activeProject, isAdmin } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.INVITE),
      onClick: (closeModal) => {
        handleSubmit(this.inviteUserAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.headerInviteUserModal)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-description')}>{intl.formatMessage(messages.description)}</p>
        <form className={cx('invite-form')}>
          <ModalField label={intl.formatMessage(messages.emailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="user" format={this.formatUser}>
              <FieldErrorHint>
                <InputUserSearch
                  projectId={activeProject}
                  isAdmin={isAdmin}
                  placeholder={intl.formatMessage(messages.inputPlaceholder)}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.role)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="role">
              <InputDropdown options={ROLES_MAP} onChange={this.selectRole} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
