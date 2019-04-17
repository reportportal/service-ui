import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { PageButton } from './pageButton';
import { PageNumberButtons } from './pageNumberButtons';
import LastPageArrowIcon from './img/last-page-arrow-inline.svg';
import FirstPageArrowIcon from './img/first-page-arrow-inline.svg';
import NextPageArrowIcon from './img/next-page-arrow-inline.svg';
import PreviousPageArrowIcon from './img/previous-page-arrow-inline.svg';

import styles from './pageButtons.scss';

const cx = classNames.bind(styles);

export const PageButtons = ({ activePage, pageCount, onChangePage }) => (
  <ul className={cx('page-buttons')}>
    <PageButton disabled={activePage === 1} hideOnMobile onClick={() => onChangePage(1)}>
      {Parser(FirstPageArrowIcon)}
    </PageButton>
    <PageButton disabled={activePage === 1} onClick={() => onChangePage(activePage - 1)}>
      {Parser(PreviousPageArrowIcon)}
    </PageButton>
    <PageNumberButtons activePage={activePage} pageCount={pageCount} onChangePage={onChangePage} />
    <PageButton disabled={activePage === pageCount} onClick={() => onChangePage(activePage + 1)}>
      {Parser(NextPageArrowIcon)}
    </PageButton>
    <PageButton
      disabled={activePage === pageCount}
      hideOnMobile
      onClick={() => onChangePage(pageCount)}
    >
      {Parser(LastPageArrowIcon)}
    </PageButton>
  </ul>
);
PageButtons.propTypes = {
  activePage: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func,
};
PageButtons.defaultProps = {
  onChangePage: () => {},
};
