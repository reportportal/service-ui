import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

const messages = defineMessages({
  header: {
    id: 'DeleteImageModal.header',
    defaultMessage: 'Delete image',
  },
  text: {
    id: 'DeleteImageModal.text',
    defaultMessage: 'Are you sure you want to delete profile photo?',
  },
});

@withModal('deleteImageModal')
@injectIntl
export class DeleteImageModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      onRemove: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
  };
  render() {
    const { intl, data } = this.props;
    const deleteButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: (closeModal) => {
        data.onRemove();
        closeModal();
      },
    };
    return (
      <ModalLayout title={intl.formatMessage(messages.header)} okButton={deleteButton}>
        {intl.formatMessage(messages.text)}
      </ModalLayout>
    );
  }
}
