import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { PASSED, FAILED, SKIPPED, MANY, NOT_FOUND, RESETED } from 'common/constants/launchStatuses';
import { getDuration } from 'common/utils';
import classNames from 'classnames/bind';
import { HistoryLineItemBadges } from './historyLineItemBadges';
import styles from './historyLineItemContent.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  launchPassed: {
    id: 'HistoryLineItemContent.launchPassed',
    defaultMessage: 'Passed',
  },
  launchReseted: {
    id: 'HistoryLineItemContent.launchReseted',
    defaultMessage: 'Item is empty',
  },
  launchFailed: {
    id: 'HistoryLineItemContent.launchFailed',
    defaultMessage: 'Failed',
  },
  launchNotFound: {
    id: 'HistoryLineItemContent.launchNotFound',
    defaultMessage: 'No item in launch',
  },
  launchSkipped: {
    id: 'HistoryLineItemContent.launchSkipped',
    defaultMessage: 'Skipped',
  },
  launchSameItems: {
    id: 'HistoryLineItemContent.launchSameItems',
    defaultMessage: "There're several items with the same UID meaning.",
  },
});

const blockTitleMessagesMap = {
  [PASSED]: messages.launchPassed,
  [FAILED]: messages.launchFailed,
  [SKIPPED]: messages.launchSkipped,
  [RESETED]: messages.launchReseted,
  [MANY]: messages.launchSameItems,
  [NOT_FOUND]: messages.launchNotFound,
};

@injectIntl
export class HistoryLineItemContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onClick: PropTypes.func,
    status: PropTypes.string,
    statistics: PropTypes.shape({
      defects: PropTypes.object,
    }),
    hasChilds: PropTypes.bool,
    active: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    isLastItem: PropTypes.bool,
    start_time: PropTypes.number,
    end_time: PropTypes.number,
  };

  static defaultProps = {
    onClick: () => {},
    status: '',
    statistics: {},
    hasChilds: false,
    active: false,
    isFirstItem: false,
    isLastItem: false,
    start_time: null,
    end_time: null,
  };

  getItemTitle = () => {
    const { intl, status, start_time, end_time } = this.props;
    let itemTitle = intl.formatMessage(blockTitleMessagesMap[status.toLowerCase()]);
    const isThreeDecimalPlaces = true;
    if (status.toLowerCase() !== MANY && status.toLowerCase() !== NOT_FOUND) {
      itemTitle = itemTitle.concat(`; ${getDuration(start_time, end_time, isThreeDecimalPlaces)}`);
    }
    return itemTitle;
  };

  render() {
    const {
      intl,
      status,
      active,
      isFirstItem,
      isLastItem,
      statistics,
      onClick,
      ...rest
    } = this.props;

    return (
      <div
        className={cx('history-line-item-content', `status-${status}`, {
          active,
          'first-item': isFirstItem,
          'last-item': isLastItem,
        })}
        title={this.getItemTitle()}
        onClick={onClick}
      >
        <div className={cx('item-block-bg')} />
        <HistoryLineItemBadges
          active={active}
          status={status}
          defects={!this.props.hasChilds ? statistics.defects : {}}
          {...rest}
        />
      </div>
    );
  }
}
