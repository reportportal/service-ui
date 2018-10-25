import 'highlight.js/styles/github.css';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import Highlight from 'react-highlight';
import { messages } from './messages';

@withModal('attachmentCodeModal')
@injectIntl
export class AttachmentCodeModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      language: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  render() {
    const {
      intl,
      data: { language, content },
    } = this.props;
    const cancelButton = {
      text: intl.formatMessage(messages.close),
    };

    return (
      <ModalLayout title={intl.formatMessage(messages.title)} cancelButton={cancelButton}>
        <form>
          <Highlight language={language}>{content}</Highlight>
        </form>
      </ModalLayout>
    );
  }
}
