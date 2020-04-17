/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
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
    intl: PropTypes.object.isRequired,
  };

  renderOkButton = () => ({
    text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE),
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
