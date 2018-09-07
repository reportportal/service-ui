import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { userInfoSelector, userIdSelector } from 'controllers/user';
import { ModalLayout, withModal } from 'components/main/modal';

const messages = defineMessages({
  header: {
    id: 'ForceUpdateModal.header',
    defaultMessage: 'Warning!',
  },
  text: {
    id: 'ForceUpdateModal.text',
    defaultMessage:
      "Update data from {account}: Information for user '{user}' has been successfully synchronized.",
  },
  additionalText: {
    id: 'ForceUpdateModal.additionalText',
    defaultMessage: 'Please relogin to apply changes!',
  },
  relogin: {
    id: 'ForceUpdateModal.relogin',
    defaultMessage: 'Relogin',
  },
});

@withModal('forceUpdateModal')
@connect((state) => ({
  accountType: userInfoSelector(state).account_type,
  user: userIdSelector(state),
}))
@injectIntl
export class ForceUpdateModal extends Component {
  static propTypes = {
    accountType: PropTypes.string,
    user: PropTypes.string,
    data: PropTypes.shape({
      onForceUpdate: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    accountType: '',
    user: '',
  };
  render() {
    const { intl, data } = this.props;
    const reloginButton = {
      text: intl.formatMessage(messages.relogin),
      onClick: (closeModal) => {
        data.onForceUpdate();
        closeModal();
      },
    };
    return (
      <ModalLayout title={intl.formatMessage(messages.header)} okButton={reloginButton}>
        {intl.formatMessage(messages.text, {
          account: this.props.accountType,
          user: this.props.user,
        })}
      </ModalLayout>
    );
  }
}
