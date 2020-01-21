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
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './regenerateAccessTokenModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'RegenerateAccessTokenModal.header',
    defaultMessage: 'Regenerate access token',
  },
  warning: {
    id: 'RegenerateAccessTokenModal.warning',
    defaultMessage: 'Warning!',
  },
  text: {
    id: 'RegenerateAccessTokenModal.text',
    defaultMessage: 'All configured agents with old access token will not be working after that.',
  },
});

@withModal('regenerateAccessTokenModal')
@injectIntl
export class RegenerateAccessTokenModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      onRegenerate: PropTypes.func,
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };
  render() {
    const { intl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => {
        data.onRegenerate();
        closeModal();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('warning')}>{intl.formatMessage(messages.warning)}</p>
        <p className={cx('text')}>{intl.formatMessage(messages.text)}</p>
      </ModalLayout>
    );
  }
}
