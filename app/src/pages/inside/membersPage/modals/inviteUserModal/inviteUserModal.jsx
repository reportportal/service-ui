import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_PROJECT_ROLE } from 'common/constants/projectRoles';
import { withModal, ModalLayout } from 'components/main/modal';
import classNames from 'classnames/bind';
import { InviteUserForm } from './inviteUserForm';
import { ExternalUserContent } from './externalUserContent';
import styles from './inviteUserModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage: 'Invite user to the project',
  },
});

@withModal('inviteUserModal')
@injectIntl
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
  };
  static defaultProps = {
    intl: {},
  };
  state = {
    externalUser: false,
    externalUserData: {},
  };
  inviteUserAndCloseModal = (closeModal) => (data) => {
    this.props.data.onInvite(data).then((res) => {
      if (data.user.externalUser) {
        res.email = data.user.userLogin;
        this.setState({ externalUser: true });
        this.setState({ externalUserData: res });
      } else {
        closeModal();
      }
    });
  };
  render() {
    const { intl, handleSubmit } = this.props;
    let okButton;
    let cancelButton;
    let content;
    if (this.state.externalUser) {
      content = (
        <ExternalUserContent
          email={this.state.externalUserData.email}
          link={this.state.externalUserData.backLink}
        />
      );
      okButton = {
        text: intl.formatMessage(COMMON_LOCALE_KEYS.OK),
        onClick: (closeModal) => {
          handleSubmit(closeModal)();
        },
      };
      cancelButton = null;
    } else {
      content = <InviteUserForm />;
      okButton = {
        text: intl.formatMessage(COMMON_LOCALE_KEYS.INVITE),
        onClick: (closeModal) => {
          handleSubmit(this.inviteUserAndCloseModal(closeModal))();
        },
      };
      cancelButton = {
        text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      };
    }
    return (
      <ModalLayout
        title={intl.formatMessage(messages.headerInviteUserModal)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-description')}>{intl.formatMessage(messages.description)}</p>
        {content}
      </ModalLayout>
    );
  }
}
