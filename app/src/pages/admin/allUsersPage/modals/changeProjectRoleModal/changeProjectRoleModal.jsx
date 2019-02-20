import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { ModalLayout, withModal } from 'components/main/modal';
import { injectIntl, defineMessages, intlShape } from 'react-intl';

const messages = defineMessages({
  changeAccountRoleText: {
    id: 'ChangeProjectRoleModal.changeAccountRoleText',
    defaultMessage: "Are you sure you want to change the account role for the '{name}' ?",
  },
  changeAccountRoleTitle: {
    id: 'ChangeProjectRoleModal.changeAccountRoleTitle',
    defaultMessage: 'Change role',
  },
  submitText: { id: 'ChangeProjectRoleModal.submitText', defaultMessage: 'Change' },
  cancelText: { id: 'ChangeProjectRoleModal.cancelText', defaultMessage: 'Cancel' },
});

@withModal('allUsersChangeProjectRoleModal')
@track()
@injectIntl
export class ChangeProjectRoleModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: intlShape.isRequired,
    tracking: PropTypes.shape({
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { onSubmit, name } = this.props.data;
    const { intl } = this.props;

    return (
      <ModalLayout
        title={intl.formatMessage(messages.changeAccountRoleTitle)}
        okButton={{
          text: intl.formatMessage(messages.submitText),
          danger: false,
          onClick: (closeModal) => {
            closeModal();
            onSubmit();
          },
        }}
        cancelButton={{
          text: intl.formatMessage(messages.cancelText),
        }}
      >
        <div>{intl.formatMessage(messages.changeAccountRoleText, { name })}</div>
      </ModalLayout>
    );
  }
}
