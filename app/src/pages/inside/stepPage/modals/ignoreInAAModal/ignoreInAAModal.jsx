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
import DOMPurify from 'dompurify';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import styles from './ignoreInAAModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ignoreButton: {
    id: 'IgnoreInAAModal.ignoreButton',
    defaultMessage: 'Ignore',
  },
  title: {
    id: 'IgnoreInAAModal.title',
    defaultMessage: 'Ignore item in auto-analysis',
  },
  titleMultiple: {
    id: 'IgnoreInAAModal.titleMultiple',
    defaultMessage: 'Ignore items in auto-analysis',
  },
  text: {
    id: 'IgnoreInAAModal.text',
    defaultMessage: "Are you sure to ignore item ''<b>{name}</b>'' in Auto-Analysis?",
  },
  textMultiple: {
    id: 'IgnoreInAAModal.textMultiple',
    defaultMessage: 'Are you sure to ignore items in Auto-Analysis?',
  },
  successMessage: {
    id: 'IgnoreInAAModal.successMessage',
    defaultMessage: 'Item was successfully ignored in Auto-Analysis',
  },
  successMessageMultiple: {
    id: 'IgnoreInAAModal.successMessageMultiple',
    defaultMessage: 'Items were successfully ignored in Auto-Analysis',
  },
});

@withModal('ignoreInAAModal')
@injectIntl
@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
  }),
  {
    showNotification,
  },
)
export class IgnoreInAAModal extends Component {
  static propTypes = {
    projectKey: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
  };

  onIgnore = (closeModal) => {
    const {
      projectKey,
      data: { items, fetchFunc },
    } = this.props;
    const issues = items.map((item) => ({
      testItemId: item.id,
      issue: {
        ...item.issue,
        ignoreAnalyzer: true,
        autoAnalyzed: false,
      },
    }));
    fetch(URLS.testItems(projectKey), {
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
      ? Parser(
          intl.formatMessage(messages.text, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            name: items[0].name,
          }),
        )
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
      text: intl.formatMessage(messages.ignoreButton),
      onClick: this.onIgnore,
      danger: true,
      eventInfo: eventsInfo.ignoreBtn,
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
