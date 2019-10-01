import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import ArrowRightIcon from 'common/img/arrow-right-small-inline.svg';
import ArrowLeftIcon from 'common/img/arrow-left-small-inline.svg';
import styles from './pagination.scss';

const cx = classNames.bind(styles);

@track()
export class Pagination extends Component {
  static propTypes = {
    activePage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  previousPage = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.PREVIOUS_LOG_MSG_PAGE);

    return this.props.onChangePage(this.props.activePage - 1);
  };

  nextPage = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.NEXT_LOG_MSG_PAGE);

    return this.props.onChangePage(this.props.activePage + 1);
  };

  isFirstPageActive = () => this.props.activePage === 1;

  isLastPageActive = () => this.props.activePage === this.props.pageCount;

  render() {
    const { activePage, pageCount } = this.props;

    return (
      <div className={cx('pagination')}>
        <button
          className={cx('arrow-button')}
          disabled={this.isFirstPageActive()}
          onClick={this.previousPage}
        >
          {Parser(ArrowLeftIcon)}
        </button>

        <div className={cx('content')}>
          <span className={cx('page')}>{activePage}</span>
          <FormattedMessage id="Common.of" defaultMessage="of" />
          <span className={cx('page')}>{pageCount}</span>
        </div>

        <button
          className={cx('arrow-button')}
          disabled={this.isLastPageActive()}
          onClick={this.nextPage}
        >
          {Parser(ArrowRightIcon)}
        </button>
      </div>
    );
  }
}
