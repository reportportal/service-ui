import PropTypes from 'prop-types';
import { PageButton } from './pageButton/index';

const MAX_PAGES = 10;

const repeatPages = (count, func) => {
  const res = [];
  for (let i = 1; i < count + 1; i++) { // eslint-disable-line no-plusplus
    res.push(func(i));
  }
  return res;
};

const getPageCount = pageCount => (pageCount <= MAX_PAGES ? pageCount : MAX_PAGES);

export const PageButtons = ({ activePage, pageCount, onChangePage }) => (
  <ul>
    <PageButton
      disabled={activePage === 1}
      onClick={() => onChangePage(1)}
    >
      first
    </PageButton>
    <PageButton
      disabled={activePage === 1}
      onClick={() => onChangePage(activePage - 1)}
    >
      previous
    </PageButton>
    {
      repeatPages(getPageCount(pageCount), page => (
        <PageButton
          key={page}
          active={activePage === page}
          onClick={() => (activePage !== page) && onChangePage(page)}
        >
          {page}
        </PageButton>
      ))
    }
    {pageCount <= MAX_PAGES ? '...' : null}
    <PageButton
      disabled={activePage === pageCount}
      onClick={() => onChangePage(activePage + 1)}
    >
      next
    </PageButton>
    <PageButton
      disabled={activePage === pageCount}
      onClick={() => onChangePage(pageCount)}
    >
      last
    </PageButton>
  </ul>
);
PageButtons.propTypes = {
  activePage: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func,
};
PageButtons.defaultProps = {
  onChangePage: () => {
  },
};
