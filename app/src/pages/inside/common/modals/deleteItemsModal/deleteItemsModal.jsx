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

import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './deleteItemsModal.scss';

const cx = classNames.bind(styles);

@withModal('deleteItemsModal')
@injectIntl
export class DeleteItemsModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      items: PropTypes.array,
      header: PropTypes.string,
      mainContent: PropTypes.string,
      namespace: PropTypes.string,
      eventsInfo: PropTypes.object,
      warning: PropTypes.string,
    }),
  };

  static defaultProps = {
    data: {
      items: [],
      onConfirm: () => {},
      eventsInfo: {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.data.onConfirm(this.props.data.items);
    closeModal();
  };

  render() {
    const {
      intl: { formatMessage },
      data: { header, mainContent, eventsInfo, warning },
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.confirmAndClose,
      eventInfo: eventsInfo.deleteBtn,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };
    return (
      <ModalLayout
        title={header}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={eventsInfo.closeIcon}
        warningMessage={warning}
      >
        <p className={cx('message')}>{Parser(mainContent)}</p>
      </ModalLayout>
    );
  }
}
