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
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import {
  userIdSelector,
  userAccountRoleSelector,
  activeProjectRoleSelector,
  isAdminSelector,
} from 'controllers/user';
import styles from './deleteWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteWidgetHeader: {
    id: 'DeleteWidgetModal.deleteWidgetHeader',
    defaultMessage: 'Delete widget',
  },
  deleteWidgetText: {
    id: 'DeleteWidgetModal.deleteWidgetText',
    defaultMessage:
      "Are you sure you want to delete widget '<b>{name}</b>'? It will no longer exist. This action can't be undone.",
  },
  deleteOwnWidgetWarning: {
    id: 'DeleteWidgetModal.deleteOwnWidgetWarning',
    defaultMessage:
      'You are going to delete your own widget. This may affect other information on your own dashboards.',
  },
  deleteWidgetAdminWarning: {
    id: 'DeleteWidgetModal.deleteWidgetAdminWarning',
    defaultMessage:
      'You are going to delete not your own widget. This may affect other users information on the project.',
  },
});

@withModal('deleteWidgetModal')
@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
  userAccountRole: userAccountRoleSelector(state),
  userProjectRole: activeProjectRoleSelector(state),
  isAdmin: isAdminSelector(state),
}))
export class DeleteWidgetModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      widget: PropTypes.object,
      onConfirm: PropTypes.func,
      eventsInfo: PropTypes.object,
    }),
    userId: PropTypes.string.isRequired,
    userAccountRole: PropTypes.string.isRequired,
    userProjectRole: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    data: {
      widget: {},
      onConfirm: () => {},
      eventsInfo: {},
    },
  };

  getWarningMessage = () => {
    const { intl, data, userId, isAdmin, userProjectRole } = this.props;
    if (data.widget.share && data.widget.owner === userId) {
      return intl.formatMessage(messages.deleteOwnWidgetWarning);
    }
    if (data.widget.owner !== userId && (isAdmin || userProjectRole === PROJECT_MANAGER)) {
      return intl.formatMessage(messages.deleteWidgetAdminWarning);
    }
    return '';
  };

  render() {
    const { intl } = this.props;
    const { widget, onConfirm, eventsInfo } = this.props.data;
    const confirmAndClose = (closeModal) => {
      onConfirm();
      closeModal();
    };
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: confirmAndClose,
      eventInfo: eventsInfo.deleteBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteWidgetHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={this.getWarningMessage()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <p className={cx('message')}>
          {Parser(intl.formatMessage(messages.deleteWidgetText, { name: widget.name }))}
        </p>
      </ModalLayout>
    );
  }
}
