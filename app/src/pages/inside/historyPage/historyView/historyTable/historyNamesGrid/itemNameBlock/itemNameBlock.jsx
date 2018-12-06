import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { PROJECT_LOG_PAGE } from 'controllers/pages';
import { NameLink } from 'pages/inside/common/nameLink';
import { ItemInfoToolTip } from './itemInfoToolTip';
import styles from './itemNameBlock.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: ItemInfoToolTip,
  data: {
    width: 'auto',
    align: 'left',
    noArrow: true,
    desktopOnly: true,
  },
})
@track()
export class ItemNameBlock extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { data, tracking } = this.props;

    return (
      <NameLink
        itemId={data.id}
        page={data.hasChildren ? null : PROJECT_LOG_PAGE}
        className={cx('name-link')}
        onClick={() => tracking.trackEvent(HISTORY_PAGE_EVENTS.CLICK_ON_ITEM)}
      >
        <p className={cx('history-grid-record-name')}>{data.name}</p>
      </NameLink>
    );
  }
}
