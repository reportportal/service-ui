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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { confirmModalAction } from 'controllers/modal';
import styles from './confirmationModal.scss';

const cx = classNames.bind(styles);

@withModal('confirmationModal')
@connect(null, {
  confirmModal: confirmModalAction,
})
export class ConfirmationModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    confirmModal: PropTypes.func.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const {
      message,
      onConfirm,
      title,
      confirmText,
      cancelText,
      dangerConfirm,
      eventsInfo = {},
    } = this.props.data;
    const { confirmModal } = this.props;
    return (
      <ModalLayout
        title={title}
        okButton={{
          text: confirmText,
          danger: dangerConfirm,
          onClick: (closeModal) => {
            confirmModal();
            closeModal();
            onConfirm();
          },
          eventInfo: eventsInfo.confirmBtn,
        }}
        cancelButton={{
          text: cancelText,
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <p className={cx('message')}>{Parser(message)}</p>
      </ModalLayout>
    );
  }
}
