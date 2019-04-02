import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout } from 'components/main/modal';
import classNames from 'classnames/bind';
import styles from './unassignModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  unassign: {
    id: 'UnassignModal.unassign',
    defaultMessage: 'Unassign',
  },
  modalHeader: {
    id: 'UnassignModal.modalHeader',
    defaultMessage: 'Unassign user',
  },
  modalText: {
    id: 'UnassignModal.modalText',
    defaultMessage:
      "Are you sure you want to unassign user '<b>{user}</b>' from the project '<b>{project}</b>'?",
  },
});

@withModal('unassignModal')
@injectIntl
export class UnassignModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      unassignAction: PropTypes.func,
      user: PropTypes.string,
      project: PropTypes.string,
    }).isRequired,
  };
  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.unassign),
      danger: true,
      onClick: (closeModal) => {
        this.props.data.unassignAction();
        closeModal();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.modalHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('message')}>
          {Parser(
            intl.formatMessage(messages.modalText, {
              user: this.props.data.user,
              project: this.props.data.project,
            }),
          )}
        </p>
      </ModalLayout>
    );
  }
}
