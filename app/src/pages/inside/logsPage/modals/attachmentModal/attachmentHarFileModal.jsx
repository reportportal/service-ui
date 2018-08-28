import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { messages } from './messages';
import { WithZipJs } from './har/WithZipJs';
import { PerfCascade } from './har/PerfCascade';
import './attachmentModal.scss';

@withModal('attachmentHarFileModal')
@injectIntl
export class AttachmentHarFileModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      harData: PropTypes.object.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  renderOkButton = (intl) => ({
    text: intl.formatMessage(messages.close),
    onClick: (closeModal) => closeModal(),
  });

  render = () => {
    const {
      intl,
      data: { harData },
    } = this.props;
    return (
      <ModalLayout title={intl.formatMessage(messages.title)} okButton={this.renderOkButton(intl)}>
        <WithZipJs>
          <PerfCascade harData={harData} />
        </WithZipJs>
      </ModalLayout>
    );
  };
}
