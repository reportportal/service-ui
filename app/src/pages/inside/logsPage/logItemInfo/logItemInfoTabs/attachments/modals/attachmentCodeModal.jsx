import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import Highlight from 'react-highlight';
import 'highlight.js/styles/github.css';
import { ATTACHMENT_CODE_MODAL_ID } from 'controllers/log/attachments';
import { messages } from './messages';

@withModal(ATTACHMENT_CODE_MODAL_ID)
@injectIntl
export class AttachmentCodeModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      extension: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  render() {
    const {
      intl,
      data: { extension, content },
    } = this.props;
    const cancelButton = {
      text: intl.formatMessage(messages.close),
    };

    return (
      <ModalLayout title={intl.formatMessage(messages.title)} cancelButton={cancelButton}>
        <form>
          <Highlight language={extension}>{content}</Highlight>
        </form>
      </ModalLayout>
    );
  }
}
