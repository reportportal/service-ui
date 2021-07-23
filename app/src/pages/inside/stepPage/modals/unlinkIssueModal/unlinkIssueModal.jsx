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
import { ItemsList } from '../makeDecisionModal/optionsSection/itemsList';
import styles from './unlinkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  unlink: {
    id: 'UnlinkIssueModal.unlink',
    defaultMessage: 'Unlink',
  },
  unlinkIssue: {
    id: 'UnlinkIssueModal.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  unlinkModalConfirmationText: {
    id: 'UnlinkIssueModal.unlinkModalConfirmationText',
    defaultMessage: 'Are you sure to unlink issue/s for test items?',
  },
  unlinkSuccessMessage: {
    id: 'UnlinkIssueModal.unlinkSuccessMessage',
    defaultMessage: 'Completed successfully!',
  },
  unlinkIssueForTheTest: {
    id: 'UnlinkIssueModal.unlinkIssueForTheTest',
    defaultMessage: 'Unlink Issue for the test {launchNumber}',
  },
  cancel: {
    id: 'UnlinkIssueModal.cancel',
    defaultMessage: 'Cancel',
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

  isBulkOperation = this.props.data.items.length > 1;

  constructor(props) {
    super(props);
    const {
      data: { items },
    } = props;
    const selectedItems = this.isBulkOperation
      ? items.map((item) => {
          return { ...item, itemId: item.id };
        })
      : items;
    this.state = {
      loading: false,
      testItems: selectedItems,
      selectedItems,
    };
  }

  onUnlink = () => {
    const {
      intl,
      url,
      data: { fetchFunc, eventsInfo },
      tracking: { trackEvent },
    } = this.props;
    const { selectedItems } = this.state;
    const dataToSend = selectedItems.reduce(
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
  componentDidMount() {
    const { intl, activeProject } = this.props;
    const { testItems } = this.state;
    const fetchLogs = () => {
      this.setState({ loading: true });
      const itemIds = testItems.map((item) => item.id);

      fetch(URLS.bulkLastLogs(activeProject), {
        method: 'post',
        data: { itemIds, logLevel: 'ERROR' },
      })
        .then((response) => {
          const testItemLogs = response.content;
          const items = [];
          testItems.forEach((elem) => {
            items.push({ ...elem, logs: testItemLogs[elem.id] });
          });
          this.setState({
            testItems: items,
            loading: false,
          });
        })
        .catch(() => {
          this.setState({
            testItems: [],
            selectedItems: [],
            loading: false,
          });
          this.props.showNotification({
            message: intl.formatMessage(messages.linkIssueFailed),
            type: NOTIFICATION_TYPES.ERROR,
          });
        });
    };
    fetchLogs();
  }

  renderIssueFormHeaderElements = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <>
        <GhostButton
          onClick={() => this.props.hideModalAction()}
          disabled={false}
          transparentBorder
          transparentBackground
          appearance="topaz"
        >
          {formatMessage(messages.cancel)}
        </GhostButton>
        <GhostButton onClick={this.onUnlink} disabled={false} color="''" appearance="topaz">
          {formatMessage(messages.unlinkIssue)}
        </GhostButton>
      </>
    );
  };
  renderTitle = (collapsedRightSection) => {
    const {
      data: { items },
      intl: { formatMessage },
    } = this.props;
    return collapsedRightSection
      ? formatMessage(messages.unlinkIssueForTheTest, {
          launchNumber: items.launchNumber && `#${items.launchNumber}`,
        })
      : formatMessage(messages.unlink);
  };

  setItems = (newState) => {
    this.setState(newState);
  };

  renderRightSection = (collapsedRightSection) => {
    const { testItems, selectedItems, loading } = this.state;
    return (
      <div className={cx('items-list')}>
        <ItemsList
          setItems={this.setItems}
          testItems={testItems}
          selectedItems={selectedItems}
          isNarrowView={collapsedRightSection}
          isBulkOperation={this.isBulkOperation}
          loading={loading}
        />
      </div>
    );
  };

  render() {
    const { intl } = this.props;

    return (
      <DarkModalLayout
        renderHeaderElements={this.renderIssueFormHeaderElements}
        renderTitle={this.renderTitle}
        renderRightSection={this.renderRightSection}
      >
        {() => (
          <p className={cx('main-text')}>
            {intl.formatMessage(messages.unlinkModalConfirmationText)}
          </p>
        )}
      </DarkModalLayout>
    );
  }
}
