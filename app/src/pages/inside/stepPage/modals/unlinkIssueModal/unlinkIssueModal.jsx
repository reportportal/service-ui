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
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { withModal } from 'components/main/modal';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { hideModalAction } from 'controllers/modal';
import { Footer } from 'pages/inside/stepPage/modals/makeDecisionModal/footer';
import { messages as makeDecisionMessages } from 'pages/inside/stepPage/modals/makeDecisionModal/messages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './unlinkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  unlinkIssue: {
    id: 'UnlinkIssueModal.unlinkIssue',
    defaultMessage: 'Unlink Issue',
  },
  unlinkModalConfirmationText: {
    id: 'UnlinkIssueModal.unlinkModalConfirmationText',
    defaultMessage: 'Are you sure to unlink issue/s for test items?',
  },
  unlinkSuccessMessage: {
    id: 'UnlinkIssueModal.unlinkSuccessMessage',
    defaultMessage: 'Completed successfully!',
  },
});

@withModal('unlinkIssueModal')
@injectIntl
@track()
@connect(
  (state) => ({
    url: URLS.testItemsUnlinkIssues(activeProjectSelector(state)),
    activeProject: activeProjectSelector(state),
  }),
  {
    showNotification,
    hideModalAction,
  },
)
export class UnlinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    hideModalAction: PropTypes.func,
  };

  onUnlink = () => {
    const {
      intl,
      url,
      data: { items, fetchFunc, eventsInfo = {} },
      tracking: { trackEvent },
    } = this.props;
    const dataToSend = items.reduce(
      (acc, item) => {
        acc.testItemIds.push(item.id);
        acc.ticketIds = acc.ticketIds.concat(
          item.issue.externalSystemIssues.map((issue) => issue.ticketId),
        );
        item.issue.autoAnalyzed
          ? trackEvent(eventsInfo.unlinkAutoAnalyzedTrue)
          : trackEvent(eventsInfo.unlinkAutoAnalyzedFalse);
        return acc;
      },
      {
        ticketIds: [],
        testItemIds: [],
      },
    );

    fetch(url, {
      method: 'put',
      data: dataToSend,
    })
      .then(() => {
        fetchFunc();
        this.props.hideModalAction();
        this.props.showNotification({
          message: intl.formatMessage(messages.unlinkSuccessMessage),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(showDefaultErrorNotification);
  };

  getFooterButtons = () => ({
    cancelButton: (
      <GhostButton
        onClick={this.props.hideModalAction}
        color="''"
        appearance="topaz"
        transparentBackground
      >
        {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
      </GhostButton>
    ),
    okButton: (
      <GhostButton onClick={this.onUnlink} color="''" appearance="topaz">
        {this.props.intl.formatMessage(messages.unlinkIssue)}
      </GhostButton>
    ),
  });

  render() {
    const {
      intl: { formatMessage },
      data: { items },
    } = this.props;

    return (
      <DarkModalLayout
        headerTitle={formatMessage(messages.unlinkIssue)}
        footer={
          <Footer
            infoBlock={
              items.length > 1
                ? formatMessage(makeDecisionMessages.applyToItems, {
                    itemsCount: items.length,
                  })
                : formatMessage(makeDecisionMessages.applyToItem)
            }
            buttons={this.getFooterButtons()}
          />
        }
      >
        {() => (
          <p className={cx('main-text')}>{formatMessage(messages.unlinkModalConfirmationText)}</p>
        )}
      </DarkModalLayout>
    );
  }
}
