import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_HAR_FILE_MODAL_ID } from 'controllers/log/attachments';
import { messages } from './messages';
import { WithZipJs } from './har/WithZipJs';
import { PerfCascade } from './har/PerfCascade';

@withModal(ATTACHMENT_HAR_FILE_MODAL_ID)
@injectIntl
export class AttachmentHarFileModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      harData: PropTypes.object.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  renderOkButton = () => ({
    text: this.props.intl.formatMessage(messages.close),
    onClick: (closeModal) => closeModal(),
  });

  render = () => {
    const {
      intl: { formatMessage },
      data: { harData },
    } = this.props;
    return (
      <ModalLayout title={formatMessage(messages.title)} okButton={this.renderOkButton()}>
        <WithZipJs>
          <PerfCascade
            harData={harData}
            errorMessage={formatMessage(messages.errorFileStructure)}
          />
        </WithZipJs>
      </ModalLayout>
    );
  };
}
