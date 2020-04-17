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
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout } from 'components/main/modal';
import { PermissionMap } from './permissionMap';
import styles from './permissionMapModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  permissionMapHeader: {
    id: 'PermissionMapModal.headerPermissionMapModal',
    defaultMessage: 'Permission map',
  },
});

@withModal('permissionMapModal')
@injectIntl
export class PermissionMapModal extends Component {
  static propTypes = {
    intl: PropTypes.object,
  };
  static defaultProps = {
    intl: {},
  };
  render() {
    const okButton = {
      text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => {
        closeModal();
      },
    };
    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.permissionMapHeader)}
        className={cx('permission-map')}
        okButton={okButton}
      >
        <PermissionMap />
      </ModalLayout>
    );
  }
}
