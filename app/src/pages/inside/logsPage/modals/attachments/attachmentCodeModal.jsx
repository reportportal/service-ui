import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_HIGHLIGHT_STYLE } from 'common/constants/hightLightStyle';
import { ModalLayout, withModal } from 'components/main/modal';
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
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE),
    };

    return (
      <ModalLayout title={intl.formatMessage(messages.title)} cancelButton={cancelButton}>
        <form>
          <SyntaxHighlighter
            language={extension}
            style={atomOneLight}
            customStyle={DEFAULT_HIGHLIGHT_STYLE}
          >
            {content}
          </SyntaxHighlighter>
        </form>
      </ModalLayout>
    );
  }
}
