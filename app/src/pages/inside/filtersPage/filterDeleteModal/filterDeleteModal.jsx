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
import track from 'react-tracking';
import { FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './filterDeleteModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteFilterHeader: {
    id: 'DeleteFilterDialog.deleteFilterHeader',
    defaultMessage: 'Delete filter',
  },
  deleteFilterText: {
    id: 'DeleteFilterDialog.deleteFilter',
    defaultMessage:
      "Are you sure you want to delete filter <b>''{name}''</b>? It will no longer exist.",
  },
  deleteFilterOwnerWarning: {
    id: 'DeleteFilterDialog.deleteFilterOwnerWarning',
    defaultMessage:
      'You are going to delete not your own filter. This may affect other users information on the project.',
  },
});

@withModal('filterDeleteModal')
@injectIntl
@track()
export class FilterDeleteModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      filter: PropTypes.object,
      onConfirm: PropTypes.func,
      userId: PropTypes.string.isRequired,
    }),
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      filter: {},
      onConfirm: () => {},
    },
  };

  render() {
    const { intl, tracking } = this.props;
    const { filter, onConfirm, userId } = this.props.data;
    const confirmAndClose = (closeModal) => {
      onConfirm();
      closeModal();
      tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_DELETE_BTN_MODAL_DELETE_FILTER);
    };
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: FILTERS_PAGE_EVENTS.CLICK_CANCEL_BTN_MODAL_DELETE_FILTER,
    };
    const warningMessage =
      filter.owner !== userId ? intl.formatMessage(messages.deleteFilterOwnerWarning) : undefined;

    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteFilterHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={FILTERS_PAGE_EVENTS.CLICK_CLOSE_ICON_MODAL_DELETE_FILTER}
        warningMessage={warningMessage}
      >
        <p className={cx('message')}>
          {Parser(intl.formatMessage(messages.deleteFilterText, { name: filter.name }))}
        </p>
      </ModalLayout>
    );
  }
}
