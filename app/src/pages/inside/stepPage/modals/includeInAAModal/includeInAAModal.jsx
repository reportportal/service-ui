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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { ModalLayout, withModal } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import styles from './includeInAAModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  includeButton: {
    id: 'IncludeInAAModal.includeButton',
    defaultMessage: 'Include',
  },
  title: {
    id: 'IncludeInAAModal.title',
    defaultMessage: 'Include item in auto-analysis',
  },
  titleMultiple: {
    id: 'IncludeInAAModal.titleMultiple',
    defaultMessage: 'Include items in auto-analysis',
  },
  text: {
    id: 'IncludeInAAModal.text',
    defaultMessage: "Are you sure to include item '<b>{name}</b>' in Auto-Analysis?",
  },
  textMultiple: {
    id: 'IncludeInAAModal.textMultiple',
    defaultMessage: 'Are you sure to include items in Auto-Analysis?',
  },
  successMessage: {
    id: 'IncludeInAAModal.successMessage',
    defaultMessage: 'Item was successfully included in Auto-Analysis',
  },
  successMessageMultiple: {
    id: 'IncludeInAAModal.successMessageMultiple',
    defaultMessage: 'Items were successfully included in Auto-Analysis',
  },
});

@withModal('includeInAAModal')
@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
export class IncludeInAAModal extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
  };

  onInclude = (closeModal) => {
    const {
      activeProject,
      data: { items, fetchFunc },
    } = this.props;
    const issues = items.map((item) => ({
      testItemId: item.id,
      issue: {
        ...item.issue,
        ignoreAnalyzer: false,
        autoAnalyzed: false,
      },
    }));
    fetch(URLS.testItems(activeProject), {
      method: 'put',
      data: {
        issues,
      },
    }).then(
      () => {
        fetchFunc();
        this.props.showNotification({
          message: this.getSuccessText(),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        closeModal();
      },
      (error) => {
        this.props.showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
        closeModal();
      },
    );
  };

  getModalTitle = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? intl.formatMessage(messages.title)
      : intl.formatMessage(messages.titleMultiple);
  };

  getModalText = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? Parser(intl.formatMessage(messages.text, { name: items[0].name }))
      : intl.formatMessage(messages.textMultiple);
  };

  getSuccessText = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? intl.formatMessage(messages.successMessage)
      : intl.formatMessage(messages.successMessageMultiple);
  };

  render() {
    const {
      intl,
      data: { eventsInfo = {} },
    } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.includeButton),
      onClick: this.onInclude,
      eventInfo: eventsInfo.includeBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };
    return (
      <ModalLayout
        className={cx('message')}
        title={this.getModalTitle()}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        {this.getModalText()}
      </ModalLayout>
    );
  }
}
