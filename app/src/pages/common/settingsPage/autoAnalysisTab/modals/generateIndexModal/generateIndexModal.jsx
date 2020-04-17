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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetchProjectAction } from 'controllers/project';
import { projectIdSelector } from 'controllers/pages';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { withModal, ModalLayout } from 'components/main/modal';
import styles from './generateIndexModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  generateIndexHeader: {
    id: 'GenerateIndexModal.headerGenerateIndexModal',
    defaultMessage: 'Generate index',
  },
  contentHeaderMessage: {
    id: 'GenerateIndexModal.contentHeaderMessage',
    defaultMessage: 'Are you sure to generate index in the ElasticSearch?',
  },
  noteBlockTitle: {
    id: 'GenerateIndexModal.noteBlockTitle',
    defaultMessage: 'Note:',
  },
  noteBlockText: {
    id: 'GenerateIndexModal.noteBlockText',
    defaultMessage: 'You will receive an e-mail after the end of the process.',
  },
  generateButtonText: {
    id: 'GenerateIndexModal.generateButtonText',
    defaultMessage: 'Generate',
  },
  generateSuccessNotification: {
    id: 'GenerateIndexModal.generateSuccessNotification',
    defaultMessage: 'Index generation is in progress',
  },
});

@withModal('generateIndexModal')
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    fetchProjectAction,
    showNotification,
    showDefaultErrorNotification,
  },
)
@injectIntl
export class GenerateIndexModal extends Component {
  static propTypes = {
    intl: PropTypes.object,
    fetchProjectAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    data: PropTypes.shape({
      modalTitle: PropTypes.object,
      modalDescription: PropTypes.object,
    }),
    projectId: PropTypes.string,
  };
  static defaultProps = {
    intl: {},
    projectId: '',
    data: {
      modalTitle: messages.generateIndexHeader,
      modalDescription: messages.contentHeaderMessage,
    },
  };

  onClickGenerate = (closeModal) => {
    fetch(URLS.projectIndex(this.props.projectId), { method: 'put' })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.generateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchProjectAction(this.props.projectId);
      })
      .catch(this.props.showDefaultErrorNotification);
    closeModal();
  };

  render() {
    const {
      intl: { formatMessage },
      data,
    } = this.props;
    const okButton = {
      text: formatMessage(messages.generateButtonText),
      onClick: this.onClickGenerate,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={formatMessage(data.modalTitle)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-description')}>{formatMessage(data.modalDescription)}</p>
        <div className={cx('note-block')}>
          <p className={cx('note-title')}>{formatMessage(messages.noteBlockTitle)}</p>
          <p className={cx('note-text')}>{formatMessage(messages.noteBlockText)}</p>
        </div>
      </ModalLayout>
    );
  }
}
