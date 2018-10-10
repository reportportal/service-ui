import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import ArrowRightIcon from 'common/img/arrow-right-small-inline.svg';
import ArrowLeftIcon from 'common/img/arrow-left-small-inline.svg';
import styles from './pagination.scss';

const cx = classNames.bind(styles);

export class Pagination extends Component {
  static propTypes = {
    activePage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
  };

  previewsPage = () => this.props.onChangePage(this.props.activePage - 1);

  nextPage = () => this.props.onChangePage(this.props.activePage + 1);

  isFirstPageActive = () => this.props.activePage === 1;

  isLastPageActive = () => this.props.activePage === this.props.pageCount;

  isNoPages = () => this.props.pageCount === 0;

  render() {
    const { activePage, pageCount } = this.props;

    return (
      <div className={cx('pagination')}>
        <button
          className={cx('arrow-button')}
          disabled={this.isFirstPageActive() || this.isNoPages()}
          onClick={this.previewsPage}
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
          disabled={this.isLastPageActive() || this.isNoPages()}
          onClick={this.nextPage}
        >
          {Parser(ArrowRightIcon)}
        </button>
      </div>
    );
  }
}
