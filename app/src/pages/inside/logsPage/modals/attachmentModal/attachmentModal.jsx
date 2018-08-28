import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import './attachmentModal.scss';
import { messages } from './messages';

@withModal('launchAttachmentModal')
@injectIntl
export class AttachmentModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.close),
      onClick: (closeModal) => closeModal(),
    };

    return (
      <ModalLayout title={intl.formatMessage(messages.title)} okButton={okButton}>
        <br />
      </ModalLayout>
    );
  }
}
